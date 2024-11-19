from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image, ImageEnhance, ImageOps
import io
import numpy as np
import cv2
from paddleocr import PaddleOCR
from functools import lru_cache
import concurrent.futures

app = FastAPI()

origins = [
    "http://localhost:6340",
    "http://127.0.0.1:6340"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO('models/best.pt')
ocr = PaddleOCR(use_angle_cls=True, lang='en', det_db_box_thresh=0.6, rec_algorithm="CRNN")

@lru_cache(maxsize=128)
def cached_perform_ocr(image_bytes):
    """Cache OCR results to avoid reprocessing identical images."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    preprocessed_image = preprocess_image(image, fast_mode=True)
    image_np = np.array(preprocessed_image)
    ocr_result = ocr.ocr(image_np, cls=True)
    return ocr_result

def preprocess_image(image, fast_mode=False):
    """Preprocess the image with optional fast mode."""
    image = ImageOps.grayscale(image)

    # Contrast and brightness adjustments
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.5) if fast_mode else enhancer.enhance(2.5)
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(1.1) if fast_mode else enhancer.enhance(1.3)

    # Convert to numpy array for OpenCV processing
    image_np = np.array(image)

    # Skip heavier denoising for faster processing in fast mode
    if not fast_mode:
        image_np = cv2.fastNlMeansDenoising(image_np, h=30)
        image_np = cv2.GaussianBlur(image_np, (3, 3), 0)

    # Apply sharpening and thresholding
    sharpening_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    sharpened_image = cv2.filter2D(image_np, -1, sharpening_kernel)
    _, binary_image = cv2.threshold(sharpened_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return Image.fromarray(binary_image)

@app.post("/detect/")
async def detect(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=400, detail="Invalid image file")

    results = model(image)

    detection_data = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for result in results:
            for box in result.boxes:
                bbox = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf.cpu().numpy())
                class_id = int(box.cls.cpu().numpy())
                label = model.names[class_id]

                cropped_image = image.crop((bbox[0], bbox[1], bbox[2], bbox[3]))

                futures.append(
                    executor.submit(process_and_ocr, cropped_image, label, confidence, bbox)
                )

        for future in concurrent.futures.as_completed(futures):
            detection_data.append(future.result())

    return JSONResponse(content=detection_data)

def process_and_ocr(cropped_image, label, confidence, bbox):
    """Process cropped image region and perform OCR."""
    text = perform_ocr(cropped_image).strip()
    return {
        "x": int(bbox[0]),
        "y": int(bbox[1]),
        "width": int(bbox[2] - bbox[0]),
        "height": int(bbox[3] - bbox[1]),
        "label": label,
        "confidence": confidence,
        "text": text  
    }

def perform_ocr(image):
    """Preprocess and perform OCR on a given image."""
    preprocessed_image = preprocess_image(image)
    image_np = np.array(preprocessed_image)
    ocr_result = ocr.ocr(image_np, cls=True)

    text_lines = []
    if ocr_result and ocr_result[0]:
        for line in ocr_result[0]:
            detected_text = line[1][0]
            if detected_text:
                text_lines.append(detected_text)

    return " ".join(text_lines)

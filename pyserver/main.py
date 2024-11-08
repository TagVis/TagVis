from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image, ImageEnhance, ImageOps
import io
import numpy as np
import cv2
from paddleocr import PaddleOCR

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

def preprocess_image(image):
    # Convert to grayscale
    image = ImageOps.grayscale(image)

    # Increase contrast and brightness
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(1.3)

    # Convert to numpy array for OpenCV processing
    image_np = np.array(image)

    # Apply Gaussian Blur to reduce noise
    image_np = cv2.GaussianBlur(image_np, (3, 3), 0)

    # Adaptive thresholding to convert to black and white
    _, binary_image = cv2.threshold(image_np, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Apply edge enhancement for clearer text edges
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    enhanced_image = cv2.filter2D(binary_image, -1, kernel)

    return Image.fromarray(enhanced_image)

def perform_ocr(image):
    # Preprocess the image
    preprocessed_image = preprocess_image(image)

    # Convert to numpy array for PaddleOCR
    image_np = np.array(preprocessed_image)

    # Run OCR on the processed image
    ocr_result = ocr.ocr(image_np, cls=True)

    # Extract text from OCR results
    if ocr_result and ocr_result[0]:
        text = " ".join([line[1][0] for line in ocr_result[0] if line[1][0]])
        return text
    else:
        return ""  # Return empty if no text is detected

@app.post("/detect/")
async def detect(file: UploadFile = File(...)):
    try:
        # Read and load image
        image_bytes = await file.read()
        print("File size:", len(image_bytes))
        print("File content type:", file.content_type)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Perform detection
    results = model(image)

    detection_data = []
    for result in results:
        for box in result.boxes:
            bbox = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf.cpu().numpy())
            class_id = int(box.cls.cpu().numpy())
            label = model.names[class_id]

            # Crop the detected region for OCR
            cropped_image = image.crop((bbox[0], bbox[1], bbox[2], bbox[3]))

            # Perform OCR on the cropped region
            text = perform_ocr(cropped_image).strip()

            # Append detection data with OCR result
            detection_data.append({
                "x": int(bbox[0]),
                "y": int(bbox[1]),
                "width": int(bbox[2] - bbox[0]),
                "height": int(bbox[3] - bbox[1]),
                "label": label,
                "confidence": confidence,
                "text": text  # OCR result
            })

    return JSONResponse(content=detection_data)

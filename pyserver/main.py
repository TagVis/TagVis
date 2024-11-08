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
    image = enhancer.enhance(2.5)  
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(1.3)

    # Resize for better OCR accuracy
    width, height = image.size
    image = image.resize((int(width * 2), int(height * 2)), Image.Resampling.LANCZOS)

    # Convert to numpy array for OpenCV processing
    image_np = np.array(image)

    # Apply Gaussian Blur
    image_np = cv2.GaussianBlur(image_np, (3, 3), 0)

    # Adaptive thresholding for black and white
    _, binary_image = cv2.threshold(image_np, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Deskew the image
    deskewed_image = deskew_image(binary_image)

    return Image.fromarray(deskewed_image)


def deskew_image(image_np):
    # Detect edges
    edges = cv2.Canny(image_np, 50, 150, apertureSize=3)
    # Use Hough Line Transform to detect lines
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)
    
    if lines is not None:
        # Calculate the average angle of the detected lines
        angles = []
        for rho, theta in lines[:, 0]:
            angle = (theta - np.pi / 2) * (180 / np.pi)  # Convert radian to degree
            angles.append(angle)

        # Calculate the median angle to reduce the impact of outliers
        median_angle = np.median(angles)

        # Rotate image to correct skew
        (h, w) = image_np.shape[:2]
        center = (w // 2, h // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, median_angle, 1.0)
        deskewed_image = cv2.warpAffine(image_np, rotation_matrix, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

        return deskewed_image
    else:
        # No lines found, return original image
        return image_np


def perform_ocr(image):
    # Preprocess the image
    preprocessed_image = preprocess_image(image)

    # Convert to numpy array for PaddleOCR
    image_np = np.array(preprocessed_image)

    # Run OCR on the processed image
    ocr_result = ocr.ocr(image_np, cls=True)

    # Extract text from OCR results with better handling of spaces
    text_lines = []
    if ocr_result and ocr_result[0]:
        for line in ocr_result[0]:
            detected_text = line[1][0]
            if detected_text:
                text_lines.append(detected_text)

    return " ".join(text_lines)

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

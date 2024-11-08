from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import numpy as np
from paddleocr import PaddleOCR

app = FastAPI()

# Allowed origins for CORS
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

# Load YOLO model
model = YOLO('models/best.pt')

# Initialize PaddleOCR model
ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Adjust language as needed

# Function to perform OCR on a cropped image region
def perform_ocr(image):
    # Convert the PIL image to a numpy array
    image_np = np.array(image)
    
    # Run OCR on the image
    ocr_result = ocr.ocr(image_np, cls=True)
    
    # Check if OCR detected any text
    if ocr_result and ocr_result[0]:  # Ensure we have valid data
        # Extract text from OCR results
        text = " ".join([line[1][0] for line in ocr_result[0] if line[1][0]])
        return text
    else:
        return ""  # Return empty string if no text is detected

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

    # Return detections with OCR data
    return JSONResponse(content=detection_data)

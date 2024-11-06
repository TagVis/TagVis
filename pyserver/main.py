from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

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

@app.post("/detect/")
async def detect(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        print("File size:", len(image_bytes)) 
        print("File content type:", file.content_type)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        print("Error:", e) 
        raise HTTPException(status_code=400, detail="Invalid image file")

    results = model(image)

    detection_data = []
    for result in results:
        for box in result.boxes:
            bbox = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf.cpu().numpy())
            class_id = int(box.cls.cpu().numpy())
            label = model.names[class_id]

            detection_data.append({
                "x": int(bbox[0]),
                "y": int(bbox[1]),
                "width": int(bbox[2] - bbox[0]),
                "height": int(bbox[3] - bbox[1]),
                "label": label,
                "confidence": confidence
            })

    return JSONResponse(content=detection_data)
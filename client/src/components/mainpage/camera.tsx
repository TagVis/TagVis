import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import CameraLogo from "../../assets/Camera.png";

export const Camera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const poCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const partCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const qtyCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  interface Detection {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    text?: string; 
  }

  const [detections, setDetections] = useState<Detection[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    const startVideo = async () => {
      if (selectedDeviceId && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("Error accessing the selected camera:", error);
        }
      }
    };
    startVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [selectedDeviceId]);


  const captureAndDetect = async () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }


      const blob = await new Promise((resolve, reject) => {
        if (canvasRef.current) {
          canvasRef.current.toBlob(resolve, "image/jpeg");
        } else {
          reject(new Error("Canvas is null"));
        }
      });
      const formData = new FormData();
      formData.append("file", blob as Blob, "frame.jpg");


      const response = await fetch("http://127.0.0.1:8000/detect/", {
        method: "POST",
        body: formData,
      });
      const detectionData = await response.json();
      console.log("Detection data received:", detectionData);

      
      const updatedDetections = await Promise.all(
        detectionData.map(async (det: Detection) => {
          if (["PO no", "part no", "qty"].includes(det.label)) {
            const rawText = await performOCR(det); 
            console.log(`OCR result for ${det.label}:`, rawText);
            return { ...det, text: rawText };
          }
          return det;
        })
      );
      setDetections(updatedDetections);
    }
  };

  const performOCR = async (detection: Detection) => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      let tempCanvas;

      if (detection.label === "PO no" && poCanvasRef.current) {
        tempCanvas = poCanvasRef.current;
      } else if (detection.label === "part no" && partCanvasRef.current) {
        tempCanvas = partCanvasRef.current;
      } else if (detection.label === "qty" && qtyCanvasRef.current) {
        tempCanvas = qtyCanvasRef.current;
      }

      if (context && tempCanvas) {
        const tempContext = tempCanvas.getContext("2d");
        const { x, y, width, height } = detection;

        const imageData = context.getImageData(x, y, width, height);
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempContext?.putImageData(imageData, 0, 0); 

        const { data: { text } } = await Tesseract.recognize(tempCanvas, "eng");
        return text;
      }
    }
    return "";
  };

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-8">
      {/* Select camera */}
      <select onChange={handleDeviceChange} value={selectedDeviceId || ''} className="p-2 border rounded">
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${device.deviceId}`}
          </option>
        ))}
      </select>


      <div className="relative w-full h-auto">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto rounded shadow-md" />

        <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
      </div>

      <div className="mt-4 flex space-x-4">
        <div>
          <canvas ref={poCanvasRef} className="border border-gray-300 rounded shadow-md" />
          <p className="text-sm text-gray-500 text-center">PO No Region</p>
        </div>
        <div>
          <canvas ref={partCanvasRef} className="border border-gray-300 rounded shadow-md" />
          <p className="text-sm text-gray-500 text-center">Part No Region</p>
        </div>
        <div>
          <canvas ref={qtyCanvasRef} className="border border-gray-300 rounded shadow-md" />
          <p className="text-sm text-gray-500 text-center">Qty Region</p>
        </div>
      </div>

      <button
        onClick={captureAndDetect}
        className="mt-4 w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center shadow-md"
        aria-label="Capture Image"
      >
        <img src={CameraLogo} alt="Capture" className="w-8 h-8" />
      </button>
    </div>
  );
};

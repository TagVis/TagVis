import { useEffect, useRef, useState } from "react";
import CameraLogo from "../../assets/Camera.png";

export const Camera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  interface Detection {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
    text: string; // OCR text from backend
  }

  const [detections, setDetections] = useState<Detection[]>([]);

  // Fetch available cameras
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

  // Start video stream
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

    // Clean up on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [selectedDeviceId]);

  // Function to capture a frame and send to backend for detection and OCR
  const captureAndDetect = async () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      // Convert the canvas to a Blob to send to the backend
      const blob = await new Promise((resolve, reject) => {
        if (canvasRef.current) {
          canvasRef.current.toBlob(resolve, "image/jpeg");
        } else {
          reject(new Error("Canvas is null"));
        }
      });
      const formData = new FormData();
      formData.append("file", blob as Blob, "frame.jpg");

      // Send frame to backend for detection and OCR
      const response = await fetch("http://127.0.0.1:8000/detect/", {
        method: "POST",
        body: formData,
      });
      const detectionData = await response.json();
      console.log("Detection data received:", detectionData);

      // Update state with received detection data
      setDetections(detectionData);
    }
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

      {/* Video feed */}
      <div className="relative w-full h-auto">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto rounded shadow-md" />

        {/* Canvas for capturing frames */}
        <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />

        {/* Display bounding boxes and OCR text based on detections */}
        {detections.map((det, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              border: "2px solid cyan",
              left: `${det.x}px`,
              top: `${det.y}px`,
              width: `${det.width}px`,
              height: `${det.height}px`,
              color: "cyan",
              pointerEvents: "none",
            }}
          >
            <span style={{ backgroundColor: "cyan", color: "black", padding: "2px 4px", fontSize: "12px" }}>
              {det.label}: {det.text} {/* Display OCR result from backend */}
            </span>
          </div>
        ))}
      </div>

      {/* Capture button */}
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

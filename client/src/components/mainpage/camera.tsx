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
    text: string;
  }

  const [detections, setDetections] = useState<Detection[]>([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isModalSuccess, setIsModalSuccess] = useState<boolean | null>(null);
  const [modalData, setModalData] = useState<Detection[] | null>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [mode, setMode] = useState<"picture" | "realTime">("picture");

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

  useEffect(() => {
    if (mode === "realTime" && isRealTimeActive) {
      const interval = setInterval(() => {
        captureAndDetect();
      }, 7000); 
      return () => clearInterval(interval);
    }
  }, [mode, isRealTimeActive, selectedDeviceId]);

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

      const filteredData = detectionData.map((det: Detection) => ({
        ...det,
        text: applyTextFilter(det.text, det.label) // Apply filtering
      }));

      setDetections(filteredData);
      validateDetections(filteredData);
    }
  };

  // Function to filter the text based on the label
  const applyTextFilter = (text: string, label: string): string => {
    const words = text.toUpperCase().split(/\s+/) // Split text into words by whitespace
  
    switch (label) {
      case "qty":
        // Find the first word that is entirely numeric for quantity
        const qty = words.find(word => /^\d+$/.test(word));
        return qty || "";
        
      case "PO no":
        // Find the first word that is a 5-digit sequence for PO no
        const poNo = words.find(word => /^\d{5}$/.test(word));
        return poNo || "";
        
      case "part no":
        // Find the first word that is exactly 3 uppercase letters for part no
        const partNo = words.find(word => /^[A-Z]{3}$/.test(word));
        return partNo || "";
        
      default:
        return "";
    }
  };

  const validateDetections = (detectionData: Detection[]) => {
    const requiredParts = ["PO no", "part no", "qty"];
    const filteredDetections = detectionData.filter((det) => requiredParts.includes(det.label));
    const allPartsDetected = filteredDetections.length === requiredParts.length;
    const allPartsHaveText = filteredDetections.every((det) => det.text && det.text.trim() !== "");

    if (allPartsDetected && allPartsHaveText) {
      setModalMessage("All parts detected successfully!");
      setIsModalSuccess(true);
      setModalData(filteredDetections);
    } else {
      setModalMessage("Detection failed. Ensure all required parts are present and have text.");
      setIsModalSuccess(false);
      setModalData(null);
    }

    setTimeout(closeModal, 3000); // Automatically close modal after 3 seconds
  };

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);
  };

  const closeModal = () => {
    setModalMessage(null);
    setIsModalSuccess(null);
    setModalData(null);
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

      {/* Mode selector */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setMode("picture")}
          className={`px-4 py-2 rounded ${mode === "picture" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Picture Mode
        </button>
        <button
          onClick={() => {
            setMode("realTime");
            setIsRealTimeActive(true);
          }}
          className={`px-4 py-2 rounded ${mode === "realTime" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Real-Time Mode
        </button>
      </div>

      {/* Video feed */}
      <div className="relative w-full h-auto">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto rounded shadow-md" />

        {/* Canvas for capturing frames */}
        <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
      </div>

      {/* Capture button for Picture Mode only */}
      {mode === "picture" && (
        <button
          onClick={captureAndDetect}
          className="mt-4 w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center shadow-md"
          aria-label="Capture Image"
        >
          <img src={CameraLogo} alt="Capture" className="w-8 h-8" />
        </button>
      )}

      {modalMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center relative">
            {isModalSuccess ? (
              <div className="text-green-500 text-4xl mb-4">✔️</div>
            ) : (
              <div className="text-red-500 text-4xl mb-4">❌</div>
            )}
            <p className="text-lg mb-4">{modalMessage}</p>
            {isModalSuccess && modalData && (
              <div className="mb-4">
                {modalData.map((det, index) => (
                  <div key={index} className="text-left text-gray-800 mb-2">
                    <strong>{det.label}:</strong> {det.text}
                  </div>
                ))}
              </div>
            )}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
              <div className="bg-blue-500 h-full animate-timer-line"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

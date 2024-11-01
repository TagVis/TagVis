import { useEffect, useRef, useState } from "react";

export const Camera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(device => device.kind === "videoinput");
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
            video: {
              deviceId: { exact: selectedDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
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

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

           const imageDataUrl = canvasRef.current.toDataURL("image/png");
        setCapturedImage(imageDataUrl);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-8">
   
      <select onChange={handleDeviceChange} value={selectedDeviceId || ''} className="p-2 border rounded">
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${device.deviceId}`}
          </option>
        ))}
      </select>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-1/2 h-auto rounded shadow-md"
      />

      
      <button onClick={captureImage} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Capture Image
      </button>

      
      <canvas ref={canvasRef} style={{ display: "none" }} />

      
      {capturedImage && (
        <div className="mt-4">
          <img src={capturedImage} alt="Captured" className="w-1/2 h-auto rounded shadow-md" />
        </div>
      )}
    </div>
  );
};

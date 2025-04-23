import { useEffect, useRef, useState } from "react";
import { IProduct } from "../../interface/product.inteface";

export default function CaptureProduct() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);
  const captureTimeout = useRef<number | null>(null);
  const progressInterval = useRef<number | null>(null);
  const [nSend, setNSend] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getDevices = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/video/");
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      console.log(response);
      setProducts(response.data || []);
      if (response.data) {
        setNSend((prev) => {
          const next = prev - 1;
          console.log(next);
          if (next === 0) {
            setIsLoading(false);
            setShowResults(true);
          }
          return next;
        });
      }
    };

    return () => wsRef.current?.close();
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch {
        alert("Gagal mengakses kamera. Izinkan akses kamera di browser.");
      }
    };
    initCamera();
  }, [selectedDeviceId]);

  const startCapture = () => {
    setIsCapturing(true);
    setShowResults(false);
    setProgress(0);

    const startTime = Date.now();
    progressInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / 15000) * 100, 100);
      setProgress(percentage);
    }, 100);

    captureTimeout.current = window.setTimeout(() => {
      stopCapture();
    }, 15000);
  };

  const stopCapture = () => {
    setIsCapturing(false);
    setProgress(0);
    if (captureTimeout.current) clearTimeout(captureTimeout.current);
    if (progressInterval.current) clearInterval(progressInterval.current);

    if (nSend > 0) {
      setIsLoading(true); // tampilkan loading sampai frame terakhir diproses
    } else {
      setShowResults(true); // langsung tampilkan hasil jika tidak ada frame dalam proses
    }
  };

  useEffect(() => {
    if (!isCapturing) return;
    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !wsRef.current?.readyState)
        return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          setNSend((prev) => {
            console.log("nSend setelah increment:", prev + 1);
            return prev + 1;
          });

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            wsRef.current?.send(JSON.stringify({ frame: base64 }));
          };
          reader.readAsDataURL(blob);
        }
      }, "image/jpeg");
    }, 500);

    return () => clearInterval(interval);
  }, [isCapturing]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        📷 Product Detection Story
      </h1>

      <div className="mb-4">
        <label htmlFor="camera" className="block mb-2 font-medium">
          Select Camera:
        </label>
        <select
          id="camera"
          className="w-full p-2 border rounded"
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(-4)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="relative w-full aspect-video rounded overflow-hidden">
        <video ref={videoRef} className="w-full rounded shadow" />

        <button
          onMouseDown={startCapture}
          onMouseUp={stopCapture}
          onClick={() => setTimeout(stopCapture, 200)}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white bg-red-500 flex items-center justify-center shadow-md z-20"
        >
          {isCapturing ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <svg className="absolute w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#fff"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                />
              </svg>
              <span className="text-white font-bold">⏺</span>
            </div>
          ) : (
            "●"
          )}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      {isLoading ? (
        <div className="mt-6 text-center text-gray-500">
          ⏳ Menunggu hasil analisis frame terakhir...
        </div>
      ) : showResults ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">🧠 Detected Products</h2>
          {products.length === 0 ? (
            <p>No product detected.</p>
          ) : (
            <ul className="list-disc pl-6">
              {products.map((prod, i) => (
                <li key={i}>
                  {prod.name} (ID: {prod._id})
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => {
              setShowResults(false);
              setProducts([]);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔁 Capture Again
          </button>
        </div>
      ) : null}
    </div>
  );
}

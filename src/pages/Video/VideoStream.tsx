import { useEffect, useRef, useState } from "react";
import TransactionForm, {
  SelectedProduct,
} from "../../components/form/FormTransaction";
import { IProduct } from "../../interface/product.inteface";
import { ML_URL } from "../../lib/envVariable";
import { getProductDetail } from "../../service/product.service";

export default function CaptureProduct() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [products, setProducts] = useState<SelectedProduct[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const captureTimeout = useRef<number | null>(null);
  const progressInterval = useRef<number | null>(null);
  const [nSend, setNSend] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptureFinished, setIsCaptureFinished] = useState(false);
  const productCacheRef = useRef<Record<string, IProduct>>({});

  useEffect(() => {
    const requestCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        // Setelah mendapatkan izin, Anda dapat menghentikan stream jika belum diperlukan
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Gagal mendapatkan akses kamera:", err);
      }
    };

    // Tambahkan event listener untuk interaksi pengguna pertama
    const handleUserInteraction = () => {
      requestCameraAccess();
      // Hapus event listener setelah permintaan dilakukan
      window.removeEventListener("click", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
    };
  }, []);

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
    const ws = new WebSocket(`wss://${ML_URL}/ws`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      if (response?.status !== 200 || !response.data) return;

      const newProducts: SelectedProduct[] = [];

      for (const { id, quantity } of response.data) {
        // Cek apakah produk sudah ada di cache
        if (!productCacheRef.current[id]) {
          try {
            const productDetail = await getProductDetail(id);
            productCacheRef.current[id] = productDetail;
          } catch (err) {
            console.error("Failed to fetch product detail:", err);
            continue;
          }
        }

        const product = productCacheRef.current[id];

        // Jika ada varian
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants[0];
          newProducts.push({
            _id: `${product._id}|${variant.name}`,
            productID: product._id,
            name: `${product.name} - ${variant.name}`,
            price: variant.price,
            stock: variant.stock,
            variantName: variant.name,
            quantity,
            subtotal: variant.price * quantity,
          });
        } else {
          newProducts.push({
            _id: product._id,
            productID: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            variantName: null,
            quantity,
            subtotal: product.price * quantity,
          });
        }
      }

      setProducts(newProducts);
      setNSend((prev) => {
        const next = prev - 1;
        if (next === 0) setIsLoading(false);
        return next;
      });
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
    }
    setIsCaptureFinished(true);
  };

  useEffect(() => {
    if (!isCapturing) return;

    // interval ~30fps → 1000ms/30 ≈ 33ms
    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ws = wsRef.current;
      if (!video || !canvas || ws?.readyState !== WebSocket.OPEN) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // resize & draw
      canvas.width = 640;
      canvas.height = 640;
      ctx.drawImage(
        video,
        0,
        0,
        video.videoWidth,
        video.videoHeight,
        0,
        0,
        640,
        640
      );

      canvas.toBlob((blob) => {
        if (!blob) return;
        setNSend((prev) => {
          console.log("nSend setelah increment:", prev + 1);
          return prev + 1;
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          ws.send(JSON.stringify({ frame: base64 }));
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg");
    }, 100);

    return () => clearInterval(interval);
  }, [isCapturing, wsRef]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        Deteksi Produk
      </h1>

      {!isCaptureFinished && (
        <div>
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

          <div className="relative w-full h-[600px] max-h-[80vh] rounded overflow-hidden">
            <video
              ref={videoRef}
              className="h-full w-auto mx-auto rounded shadow object-cover"
              playsInline
              muted
            />

            <button
              onMouseDown={startCapture}
              onMouseUp={stopCapture}
              onTouchStart={startCapture}
              onTouchEnd={stopCapture}
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
                  <span className="text-white font-bold pointer-events-none select-none">
                    ⏺
                  </span>
                </div>
              ) : (
                "●"
              )}
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {isCaptureFinished && (
        <div>
          {isLoading && (
            <div className="mt-6 text-center">
              <div className="inline-flex flex-col items-center space-y-2">
                {/* Spinner Container */}
                <div className="relative w-12 h-12 animate-spin">
                  {/* Outer Circle */}
                  <div className="absolute w-full h-full border-4 border-blue-200 rounded-full"></div>
                  {/* Inner Arc */}
                  <div className="absolute w-full h-full border-4 border-transparent border-t-blue-600 rounded-full"></div>
                </div>

                {/* Text dengan animasi */}
                <div className="text-gray-600 text-sm">
                  <span className="animate-pulse">🔄 Memproses</span>
                  <br />
                  <span className="text-xs text-gray-500">
                    Menunggu hasil analisis {nSend} frame...
                  </span>
                </div>
              </div>
            </div>
          )}
          <TransactionForm defaultSelectedProducts={products} />
          {!isLoading && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔁 Capture Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

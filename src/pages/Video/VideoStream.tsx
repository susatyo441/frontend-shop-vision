import { useCallback, useEffect, useRef, useState } from "react";
import TransactionForm, {
  SelectedProduct,
} from "../../components/form/FormTransaction";
import { IProduct } from "../../interface/product.inteface";
import { ML_URL } from "../../lib/envVariable";
import { getProductDetail } from "../../service/product.service";

interface CaptureProductProps {
  onResetRequest: () => void;
}

export default function CaptureProduct({
  onResetRequest,
}: CaptureProductProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const longPressTimeout = useRef<number | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [allProducts, setAllProducts] = useState<SelectedProduct[]>([]); // Semua produk dari berbagai sesi
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const captureTimeout = useRef<number | null>(null);
  const progressInterval = useRef<number | null>(null);
  const [nSend, setNSend] = useState(0);
  const [averageFPS, setAverageFPS] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptureFinished, setIsCaptureFinished] = useState(false);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const productCacheRef = useRef<Record<string, IProduct>>({});
  const barcodeAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousProductsRef = useRef<SelectedProduct[]>([]); // Untuk deteksi perubahan dalam satu sesi
  const sessionProductsRef = useRef<SelectedProduct[]>([]); // Produk yang terdeteksi dalam satu sesi
  const maxTime = 30000;
  const longPressTime = 1000;

  useEffect(() => {
    const requestCameraAccess = async () => {
      try {
        // Minta izin untuk kamera belakang secara spesifik
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Spesifikasi kamera belakang
          },
        });

        // Setelah mendapatkan izin, hentikan stream
        stream.getTracks().forEach((track) => track.stop());

        // Setelah izin diberikan, reload daftar perangkat
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);

        // Coba temukan kamera belakang untuk dipilih secara otomatis
        const rearCamera = videoDevices.find((device) => {
          const label = device.label.toLowerCase();
          return (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment")
          );
        });

        if (rearCamera) {
          setSelectedDeviceId(rearCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Gagal mendapatkan akses kamera belakang:", err);

        // Fallback ke kamera depan jika kamera belakang tidak tersedia
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          fallbackStream.getTracks().forEach((track) => track.stop());

          const allDevices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = allDevices.filter(
            (d) => d.kind === "videoinput"
          );
          setDevices(videoDevices);

          if (videoDevices.length > 0) {
            setSelectedDeviceId(videoDevices[0].deviceId);
          }
        } catch (fallbackErr) {
          console.error("Gagal mendapatkan akses kamera:", fallbackErr);
        }
      }
    };

    requestCameraAccess();
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
    barcodeAudioRef.current = new Audio("/sounds/store-scanner-beep-90395.mp3"); // Pastikan file ini tersedia di public folder
  }, []);

  // Fungsi untuk membuat koneksi WebSocket
  const setupWebSocket = useCallback(() => {
    // Tutup koneksi sebelumnya jika ada
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(`wss://${ML_URL}/ws`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      if (response?.status !== 200 || !response.data) return;
      setAverageFPS(response.averageFPS);
      const newSessionProducts: SelectedProduct[] = [];

      for (const { id, quantity } of response.data) {
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

        if (product.variants && product.variants.length > 0) {
          const variant = product.variants[0];
          newSessionProducts.push({
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
          newSessionProducts.push({
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

      // 🔍 DETEKSI PRODUK BARU ATAU QUANTITY BERUBAH
      const previous = previousProductsRef.current;
      let hasNewProduct = false;

      for (const newP of newSessionProducts) {
        const old = previous.find((p) => p._id === newP._id);
        if (!old || old.quantity !== newP.quantity) {
          hasNewProduct = true;
          break;
        }
      }

      if (hasNewProduct && barcodeAudioRef.current) {
        console.log("Playing barcode beep sound");
        barcodeAudioRef.current.play().catch((e) => {
          console.warn("Gagal memutar suara:", e);
        });
      }

      previousProductsRef.current = newSessionProducts;
      sessionProductsRef.current = newSessionProducts;

      setNSend((prev) => {
        const next = prev - 1;
        if (next === 0) setIsLoading(false);
        return next;
      });
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Setup WebSocket saat pertama kali
  useEffect(() => {
    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [setupWebSocket]);

  const startCamera = useCallback(async () => {
    try {
      if (selectedDeviceId) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
        });

        cameraStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      alert("Gagal mengakses kamera. Izinkan akses kamera di browser.");
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!isCaptureFinished) {
      startCamera();
    }
    return () => {
      if (isCaptureFinished) {
        stopCamera();
      }
    };
  }, [isCaptureFinished, startCamera]);

  const stopCamera = () => {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  };

  const takeAndSendFrame = useCallback(() => {
    setIsLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ws = wsRef.current;
    if (!video || !canvas || !ws || ws.readyState !== WebSocket.OPEN) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
        console.log("nSend after increment:", prev + 1);
        return prev + 1;
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        ws.send(JSON.stringify({ frame: base64 }));
      };
      reader.readAsDataURL(blob);
    }, "image/jpeg");
  }, []);

  // Unified function to stop all capture-related activities
  const stopAllCaptureActivities = useCallback(() => {
    setIsCapturing(false);
    setIsLongPress(false);
    setProgress(0);
    console.log(sessionProductsRef);

    // Tambahkan produk sesi ini ke daftar semua produk
    if (sessionProductsRef.current.length > 0) {
      setAllProducts((prev) => {
        // Buat salinan baru dari produk sebelumnya
        const updatedProducts = [...prev];

        sessionProductsRef.current.forEach((newProduct) => {
          // Cari produk yang sama berdasarkan _id
          const existingProductIndex = updatedProducts.findIndex(
            (p) => p._id === newProduct._id
          );

          if (existingProductIndex !== -1) {
            // Jika produk sudah ada, tambahkan kuantitasnya
            const existing = updatedProducts[existingProductIndex];
            updatedProducts[existingProductIndex] = {
              ...existing,
              quantity: existing.quantity + newProduct.quantity,
              subtotal: existing.subtotal + newProduct.subtotal,
            };
          } else {
            // Jika produk belum ada, tambahkan sebagai produk baru
            updatedProducts.push(newProduct);
          }
        });

        return updatedProducts;
      });
    }

    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    if (captureTimeout.current) {
      clearTimeout(captureTimeout.current);
      captureTimeout.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setIsCaptureFinished(true);
  }, []);

  const startCapture = () => {
    if (isLongPress) {
      stopAllCaptureActivities();
      return;
    }

    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    if (progressInterval.current) clearInterval(progressInterval.current);

    setIsCapturing(true);
    setProgress(0);
    const startTime = Date.now();

    // Start progress bar immediately, it will run for a maximum of 15 seconds.
    progressInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / maxTime) * 100, 100);
      setProgress(percentage);

      // Automatically stop if the max-second limit is reached.
      if (elapsed >= maxTime) {
        stopAllCaptureActivities();
      }
    }, 100);

    // Set a timeout to only enable the "long press" flag.
    longPressTimeout.current = window.setTimeout(() => {
      setIsLongPress(true);
      if ("vibrate" in navigator) {
        navigator.vibrate(200); // Bergetar selama 200ms
      }
    }, longPressTime);
  };

  const stopCapture = () => {
    // If we are in the locked long-press mode, releasing the button does nothing.
    // Capture continues until the 15s timer expires or the user presses again.
    if (isLongPress) {
      return;
    }

    // If it was a short press (<2s), stop everything on release.
    stopAllCaptureActivities();
  };

  useEffect(() => {
    return () => {
      // Cleanup all timers and intervals on component unmount
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
      if (captureTimeout.current) clearTimeout(captureTimeout.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
      stopCamera();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    console.log("isCapturing changed:", isCapturing);
    if (!isCapturing) return;
    const interval = setInterval(() => {
      takeAndSendFrame();
    }, 100); // Sends frames at ~10 FPS
    return () => clearInterval(interval);
  }, [isCapturing, takeAndSendFrame]);

  // Handler untuk tombol "Tambah Produk Lain"
  const handleAddMoreProducts = useCallback(() => {
    // Reset state untuk sesi baru
    sessionProductsRef.current = [];
    previousProductsRef.current = [];
    setIsCaptureFinished(false);

    // Restart WebSocket connection
    setupWebSocket();
  }, [setupWebSocket]);

  // Handler untuk tombol "Deteksi Ulang"
  const handleResetDetection = useCallback(() => {
    onResetRequest();
    setAllProducts([]);
    sessionProductsRef.current = [];
    previousProductsRef.current = [];
    setIsCaptureFinished(false);
    setupWebSocket();
  }, [onResetRequest, setupWebSocket]);

  const radius = 28; // Adjusted radius to fit design
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Deteksi Produk
      </h1>

      {!isCaptureFinished && (
        <div>
          <div className="mb-4">
            <label
              htmlFor="camera"
              className="block mb-2 font-medium text-gray-700"
            >
              Pilih Kamera:
            </label>
            <select
              id="camera"
              className="w-full p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div className="relative w-full h-[600px] max-h-[80vh] rounded-xl overflow-hidden bg-black shadow-xl">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />

            <canvas ref={canvasRef} className="hidden" />

            {/* Instagram-style capture button */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-24 flex items-center justify-center">
              {/* Progress ring container - expands when capturing */}
              <div
                className={`
                  absolute w-full h-full
                  transition-all duration-300 ease-in-out
                  ${isCapturing ? "scale-150" : "scale-100"}
                `}
              >
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 80 80"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#ef4444"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference - (progress / 100) * circumference
                    }
                    strokeLinecap="round"
                    className="transition-all duration-100 ease-linear"
                  />
                </svg>
              </div>

              {/* Capture button */}
              <button
                onMouseDown={startCapture}
                onMouseUp={stopCapture}
                onTouchStart={startCapture}
                onTouchEnd={stopCapture}
                className={`
                  absolute w-16 h-16 rounded-full bg-white focus:outline-none
                  flex items-center justify-center transition-all duration-200
                  ${isCapturing ? "scale-90 bg-red-500" : "hover:scale-105"}
                `}
              >
                {isCapturing ? (
                  <div className="w-8 h-8 rounded bg-red-600" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCaptureFinished && (
        <div className="mt-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex flex-col items-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute w-full h-full border-4 border-red-100 rounded-full"></div>
                  <div className="absolute w-full h-full border-4 border-transparent border-t-red-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-gray-700">
                  <span className="animate-pulse font-medium">
                    Memproses gambar...
                  </span>
                  <br />
                  <span className="text-sm text-gray-500">
                    Menganalisa {nSend} frame{nSend !== 1 ? "s" : ""}...
                  </span>
                </div>
              </div>
            </div>
          )}

          <TransactionForm defaultSelectedProducts={allProducts} />
          {!isLoading && (
            <div className="mt-8 space-y-4">
              <div className="text-center text-sm text-gray-500">
                ⏱️ Rata-rata FPS:{" "}
                <span className="font-semibold">{averageFPS}</span>
              </div>

              <div className="mt-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4/5">
                    <button
                      onClick={handleAddMoreProducts}
                      className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600 transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tambah Produk Lain
                    </button>
                  </div>

                  <div className="w-4/5">
                    <button
                      onClick={handleResetDetection}
                      className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg shadow hover:bg-amber-600 transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Deteksi Ulang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Definisikan tipe data untuk user dan payload agar lebih aman
interface IUser {
  _id: string;
  name: string;
  email: string;
  storeId: string;
}

interface IGoogleAuthPayload {
  token: string;
  user: IUser;
}

// Fungsi saveAuthToken sekarang menerima token dan objek user
const saveAuthToken = (token: string, user: IUser) => {
  localStorage.setItem("token", token);
  // Sekarang variabel 'user' sudah tersedia di sini
  localStorage.setItem("storeID", user.storeId);
  localStorage.setItem("user", JSON.stringify(user));
};

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your login...");

  useEffect(() => {
    // Ambil parameter 'data' dari URL
    const data = searchParams.get("data");

    if (data) {
      try {
        // 1. Decode Base64 menjadi string JSON
        const decodedJson = atob(data);

        // 2. Parse string JSON menjadi objek JavaScript
        const payload: IGoogleAuthPayload = JSON.parse(decodedJson);

        if (payload.token && payload.user) {
          // 3. Jika token dan user ada, simpan semuanya
          saveAuthToken(payload.token, payload.user);
          setMessage("Login successful! Redirecting to dashboard...");

          // Arahkan ke halaman utama setelah 2 detik
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          throw new Error("Invalid payload structure");
        }
      } catch (error) {
        console.error("Failed to parse auth data:", error);
        setMessage(
          "Authentication failed: Invalid data received. Redirecting..."
        );
        setTimeout(() => {
          navigate("/signin?error=invalid_data");
        }, 2000);
      }
    } else {
      // Jika tidak ada parameter 'data', berarti gagal.
      setMessage("Authentication failed. Redirecting to login page...");
      setTimeout(() => {
        navigate("/signin?error=google_auth_failed");
      }, 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.2rem",
        fontFamily: "sans-serif",
      }}
    >
      <p>{message}</p>
    </div>
  );
}

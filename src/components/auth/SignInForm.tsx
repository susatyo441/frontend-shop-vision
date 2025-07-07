import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { IToastMessage } from "../../interface/toast.interface";
import Toast from "../toast/ErrorToast";
import { loginUser } from "../../service/user.login.service";
import { getAuthToken } from "../../lib/localStorage";
import { API_URL } from "../../lib/envVariable";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  // const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email == "" || formData.password == "") {
      setToastMessage({
        message: "Harap isi semua field wajib",
        type: "error",
      });
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    try {
      await loginUser(payload);

      setToastMessage({ message: "Login berhasil", type: "success" });

      console.log(getAuthToken());

      // Tambahkan delay sebelum redirect (misalnya 2 detik)
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch {
      setToastMessage({ message: "Gagal login", type: "error" });
    }
  };

  const GOOGLE_LOGIN_URL = `${API_URL}/user/google/login`;

  return (
    <div className="flex flex-col flex-1">
      {toastMessage.message != "" && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage({ type: undefined, message: "" })}
        />
      )}

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan email dan password untuk login
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div> */}
                <div>
                  <button
                    className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm sm:text-base tracking-wide shadow-md transition-all duration-300 ease-in-out 
  hover:bg-blue-700 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                    onClick={handleLogin}
                  >
                    Masuk
                  </button>
                </div>
              </div>
            </form>

            {/* --- TAMBAHKAN KODE DI BAWAH INI --- */}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative px-4 text-sm bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                OR
              </div>
            </div>

            {/* Tombol Login Google */}
            <div>
              <a
                href={GOOGLE_LOGIN_URL}
                className="w-full flex items-center justify-center px-6 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm sm:text-base border border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-300 ease-in-out 
                                hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700"
              >
                <img
                  className="size-5 mr-3"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                />
                Masuk dengan Email Polines
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

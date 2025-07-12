import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { StarIcon } from "@heroicons/react/24/solid";
import { createQuestioner } from "../../service/questioner.service";
import { useNavigate } from "react-router-dom";
import { IToastMessage } from "../../interface/toast.interface";
import LoadingToast from "../../components/loading/ToastLoading";
import Toast from "../../components/toast/ErrorToast";
import { questions } from "../../interface/questioner.interface";
import ConfirmationModal from "../../components/common/Modal";

const ratingLabels: [string, string][] = [
  ["Sangat Sulit", "Sangat Mudah"],
  ["Sangat Lambat", "Sangat Cepat"],
  ["Sangat Tidak Akurat", "Sangat Akurat"],
  ["Sangat Tidak Percaya", "Sangat Percaya"],
  ["Sangat Tidak Jelas", "Sangat Jelas"],
  ["Sangat Sulit", "Sangat Mudah"],
  ["Sangat Tidak Jelas", "Sangat Jelas"],
  ["Sangat Tidak Membantu", "Sangat Membantu"],
  ["Sangat Sering", "Tidak Pernah"],
  ["Sangat Tidak Membantu", "Sangat Membantu"],
];

export default function QuestionerForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<number[]>(Array(11).fill(0));
  const [joinCredit, setJoinCredit] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });

  const handleAnswerChange = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const isFormValid =
    name.trim() !== "" &&
    answers.every((ans) => ans > 0) &&
    (!joinCredit || instagramUrl.trim() !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    const payload = {
      name,
      answers,
      joinCredit,
      instagramUrl: joinCredit ? instagramUrl : null,
    };
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("questioner1", payload.answers[0].toString());
    formData.append("questioner2", payload.answers[1].toString());
    formData.append("questioner3", payload.answers[2].toString());
    formData.append("questioner4", payload.answers[3].toString());
    formData.append("questioner5", payload.answers[4].toString());
    formData.append("questioner6", payload.answers[5].toString());
    formData.append("questioner7", payload.answers[6].toString());
    formData.append("questioner8", payload.answers[7].toString());
    formData.append("questioner9", payload.answers[8].toString());
    formData.append("questioner10", payload.answers[9].toString());
    if (payload.joinCredit && payload.instagramUrl) {
      formData.append("instagram", payload.instagramUrl);
    }
    try {
      createQuestioner(formData);
      setIsOpenModal(true);
    } catch {
      setIsLoading(false);
      setToastMessage({
        message: "Gagal menyimpan kuesioner",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <PageMeta
        title="Form Kuesioner | ShopVision"
        description="Form ulasan pengguna produk"
      />
      <PageBreadcrumb pageTitle="Form Kuesioner" />
      <LoadingToast message="Menyimpan kuesioner..." isLoading={isLoading} />
      <ConfirmationModal
        isOpen={isOpenModal}
        title="Terimakasih Banyak Sudah Mengisi Kuesioner"
        message="Mudah-mudahan semua keinginan dan cita-cita anda tercapai serta diberi kesehatan baik raga dan jiwa, Aamiin"
        onClose={() => navigate("/kuesioner")}
        cancelButtonText="Siap!"
      />
      {toastMessage.message != "" && (
        <>
          {console.log("Toast Message:", toastMessage)}
          <Toast
            message={toastMessage.message}
            type={toastMessage.type} // Pastikan type diberikan
            onClose={() => setToastMessage({ type: undefined, message: "" })}
          />
        </>
      )}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto p-4 space-y-6 text-sm sm:text-base"
      >
        <h1 className="text-lg sm:text-2xl font-semibold mb-4">Kuesioner</h1>

        {/* Nama */}
        <div>
          <label className="block font-medium mb-1">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nama Anda"
            required
          />
        </div>

        {/* Pertanyaan */}
        {questions.map((question, idx) => (
          <div key={idx} className="space-y-1 text-xs sm:text-sm">
            <label className="block font-medium">{question}</label>

            <div className="flex justify-between w-full mt-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  type="button"
                  key={rating}
                  onClick={() => handleAnswerChange(idx, rating)}
                  className="flex-1"
                >
                  <StarIcon
                    className={`mx-auto h-7 w-7 sm:h-9 sm:w-9 ${
                      answers[idx] >= rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } transition`}
                  />
                </button>
              ))}
            </div>

            <div className="text-[10px] sm:text-xs text-gray-500 flex justify-between px-1 mt-3">
              <span>{ratingLabels[idx][0]}</span>
              <span>{ratingLabels[idx][1]}</span>
            </div>
          </div>
        ))}

        {/* Tambah ke credit */}
        <div className="text-xs sm:text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded"
              checked={joinCredit}
              onChange={(e) => setJoinCredit(e.target.checked)}
            />
            <span>Ingin ditambahkan ke credit untuk tester?</span>
          </label>
        </div>

        {/* Instagram */}
        {joinCredit && (
          <div className="text-xs sm:text-sm">
            <label className="block font-medium mb-1">URL Instagram Anda</label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://instagram.com/username"
              required
            />
          </div>
        )}

        {/* Tombol Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-6 py-2 rounded-lg transition shadow text-sm sm:text-base ${
              isFormValid
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  IQuestionerSummary,
  questions,
} from "../../interface/questioner.interface";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { getQuestionerDetail } from "../../service/questioner.service";
import { IToastMessage } from "../../interface/toast.interface";
import Toast from "../../components/toast/ErrorToast";
import QuestionerSummaryDetail from "../../components/questioner/questioner";
import { useParams } from "react-router-dom";

export default function QuestionerDetail() {
  const { questionerId } = useParams<{ questionerId: string }>();
  const [data, setData] = useState<IQuestionerSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });

  useEffect(() => {
    // Simulasi fetch data dari API
    async function fetchQuestioner() {
      try {
        const response = await getQuestionerDetail(questionerId!);
        setData(response);
        setToastMessage({
          type: undefined,
          message: "",
        });
      } catch {
        setToastMessage({
          message: "Gagal mengambil data questioner.",
          type: "error",
        });
        setData(null);
      }
    }

    fetchQuestioner();
  }, [questionerId]);

  if (!data) {
    return <div className="text-center py-10">Memuat data...</div>;
  }

  const scores = [
    data.question1,
    data.question2,
    data.question3,
    data.question4,
    data.question5,
    data.question6,
  ];

  return (
    <div>
      <PageMeta
        title="Kuesioner Detail | ShopVision"
        description="Ringkasan hasil kuesioner pengguna"
      />
      <PageBreadcrumb pageTitle="Kuesioner Detail" />
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
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-semibold mb-2">Kuesioner Detail</h1>

        {/* Statistik utama */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-sm sm:text-base">
          <p>
            <strong>Nama:</strong> {data.name}
          </p>
          <p>
            <strong>Rata-rata:</strong> {data.average.toFixed(2)} dari 5
          </p>
        </div>

        {/* Detail tiap pertanyaan */}
        <QuestionerSummaryDetail questions={questions} scores={scores} />
      </div>
    </div>
  );
}

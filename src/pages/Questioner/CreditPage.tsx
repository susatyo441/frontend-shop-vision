import { useEffect, useState } from "react";
import { FaInstagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { ITester } from "../../interface/questioner.interface";
import { getCreditList } from "../../service/questioner.service";

export default function CreditPage() {
  const [testers, setTesters] = useState<ITester[]>([]);
  const navigate = useNavigate();

  const dosenPembimbing = [
    "Bapak Kuwat Santoso., S.T., M.Kom.",
    "Bapak Muttabik Fathul Lathief S.Kom., M.Eng.",
    "Bapak Suko Tyas Pernanda., M.Cs.",
  ];

  useEffect(() => {
    // Simulasi fetch API
    async function fetchCredits() {
      const res = await getCreditList();
      setTesters(res || []);
    }

    fetchCredits();
  }, []);

  return (
    <div>
      <PageMeta
        title="Credits | ShopVision"
        description="Ucapan terima kasih untuk pihak-pihak terkait proyek ini"
      />
      <PageBreadcrumb pageTitle="Credits" />

      <div className="max-w-3xl mx-auto p-6 space-y-10 text-sm sm:text-base">
        <h1 className="text-2xl font-bold">Ucapan Terima Kasih</h1>

        {/* Dosen Pembimbing */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Dosen Pembimbing</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-200">
            {dosenPembimbing.map((dosen, index) => (
              <li key={index}>{dosen}</li>
            ))}
          </ul>
        </section>

        {/* Tester */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Tester</h2>
          {testers.length === 0 ? (
            <p className="text-gray-500">Belum ada data tester.</p>
          ) : (
            <ul className="space-y-3">
              {testers.map((tester) => (
                <li
                  key={tester._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition"
                >
                  <span
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={() =>
                      navigate(`/kuesioner/${tester.questionerId}`)
                    }
                  >
                    {tester.name}
                  </span>

                  {tester.instagram && (
                    <a
                      href={tester.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-pink-600 hover:text-pink-500"
                    >
                      <FaInstagram className="mr-1" />
                      <span className="text-xs sm:text-sm">Instagram</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Warung Mamah Tyas */}
        <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Terima kasih kepada <strong>Warung Mamah Tyas</strong> karena telah
            mengizinkan pengambilan dataset untuk proyek ini.
          </p>
        </section>
      </div>
    </div>
  );
}

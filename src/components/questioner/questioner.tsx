import { StarIcon } from "@heroicons/react/24/solid";

interface QuestionerSummaryDetailProps {
  questions: string[];
  scores: number[];
}

export default function QuestionerSummaryDetail({
  questions,
  scores,
}: QuestionerSummaryDetailProps) {
  return (
    <div className="space-y-5">
      {questions.map((question, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-sm sm:text-base"
        >
          <p className="font-medium mb-2">{question}</p>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    scores[idx] >= star
                      ? "text-yellow-400"
                      : scores[idx] >= star - 0.5
                      ? "text-yellow-300"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500">({scores[idx].toFixed(2)})</span>
          </div>
        </div>
      ))}
    </div>
  );
}

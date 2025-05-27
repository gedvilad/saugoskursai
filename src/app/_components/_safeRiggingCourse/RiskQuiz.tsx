import { useState } from "react";

type QuizOption = {
  id: string;
  text: string;
};

type MultiCheckQuizProps = {
  title: string;
  description: string;
  options: QuizOption[];
  correctAnswers: Record<string, boolean>;
  explanations: Record<string, string>;
};

export default function MultiCheckQuiz({
  title,
  description,
  options,
  correctAnswers,
  explanations,
}: MultiCheckQuizProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, boolean>
  >(Object.fromEntries(options.map((o) => [o.id, false])));

  const handleOptionChange = (id: string) => {
    if (!isSubmitted) {
      setSelectedOptions((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const getOptionStyle = (id: string) => {
    if (!isSubmitted) return "";

    if (selectedOptions[id] === correctAnswers[id]) {
      return correctAnswers[id]
        ? "bg-green-50 border border-green-500 rounded-md p-2"
        : "";
    } else {
      return correctAnswers[id]
        ? "bg-yellow-50 border border-yellow-500 rounded-md p-2"
        : "bg-red-50 border border-red-500 rounded-md p-2";
    }
  };

  const getCheckboxStyle = (id: string) => {
    if (!isSubmitted) return "border-gray-300";

    if (correctAnswers[id]) {
      return "border-green-500 bg-green-100";
    } else if (selectedOptions[id]) {
      return "border-red-500 bg-red-100";
    }

    return "border-gray-300";
  };

  const calculateScore = () => {
    return options.reduce((score, option) => {
      return selectedOptions[option.id] === correctAnswers[option.id]
        ? score + 1
        : score;
    }, 0);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="mb-4 text-xl font-medium text-gray-800">{title}</h3>
      <p className="mb-4 text-gray-700">{description}</p>

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.id}
            className={`flex items-start ${getOptionStyle(option.id)}`}
          >
            <input
              type="checkbox"
              id={option.id}
              checked={selectedOptions[option.id]}
              onChange={() => handleOptionChange(option.id)}
              disabled={isSubmitted}
              className={`mt-1 h-4 w-4 rounded ${getCheckboxStyle(option.id)} ${
                isSubmitted ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            />
            <label
              htmlFor={option.id}
              className={`ml-2 text-gray-700 ${!isSubmitted && "cursor-pointer"}`}
              onClick={() => !isSubmitted && handleOptionChange(option.id)}
            >
              {option.text}
            </label>
          </div>
        ))}
      </div>

      {isSubmitted && (
        <div className="mt-4 rounded-md border border-gray-200 p-4">
          <p className="font-medium text-gray-800">
            Jūsų rezultatas: {calculateScore()} iš {options.length}
          </p>
          <div className="mt-2 text-gray-700">
            <p className="mb-2 font-medium">Paaiškinimai:</p>
            <ul className="list-disc space-y-1 pl-5">
              {options.map((option, index) => (
                <li
                  key={option.id}
                  className={
                    correctAnswers[option.id]
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {index + 1} teiginys –{" "}
                  {correctAnswers[option.id] ? "TEISINGAS" : "NETEISINGAS"}.{" "}
                  {explanations[option.id]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!isSubmitted && (
        <button
          className="mt-4 rounded-md bg-stone-500 px-4 py-2 text-white hover:bg-stone-600"
          onClick={handleSubmit}
        >
          Patikrinti atsakymus
        </button>
      )}
    </div>
  );
}

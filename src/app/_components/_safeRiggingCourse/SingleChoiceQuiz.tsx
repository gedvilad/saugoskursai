import { useState } from "react";

export default function SingleChoiceQuiz({
  quizData = {
    title: "Avarinis scenarijus: Ką daryti?",
    question:
      "Jūs dirbate kaip rigeris ir pastebite, kad keliant sunkų metalo lakštą, viena stropas pradeda slysti. Krovinys dar nėra pakeltas aukštai. Pasirinkite teisingą veiksmų seką:",
    options: [
      {
        id: "A",
        text: "Bandyti pataisyti stropą, kol krovinys kabo, kad išvengtumėte operacijos nutraukimo.",
      },
      {
        id: "B",
        text: "Signalizuoti operatoriui nedelsiant sustoti, įspėti darbuotojus pasišalinti ir nuleisti krovinį ant žemės.",
      },
      {
        id: "C",
        text: "Duoti signalą operatoriui skubiai užbaigti kėlimą, kad krovinys būtų greičiau nuleistas į galutinę vietą.",
      },
      {
        id: "D",
        text: "Paprašyti kito darbuotojo palaikyti krovinį, kol pats pataisysite stropą.",
      },
    ],
    correctAnswer: "B",
    correctFeedback:
      "Signalizuoti operatoriui sustoti ir įspėti aplinkinius darbuotojus yra teisingas veiksmas šioje situacijoje.",
    incorrectFeedback:
      "Saugiausia yra nedelsiant sustabdyti operaciją, įspėti darbuotojus ir nuleisti krovinį ant žemės saugiai.",
    successMessage: "Teisingai! Saugumas visada pirmiausia.",
    failureMessage: "Neteisingas atsakymas. Teisingas atsakymas yra",
  },
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    title,
    question,
    options,
    correctAnswer,
    correctFeedback,
    incorrectFeedback,
    successMessage,
    failureMessage,
  } = quizData;

  const handleOptionSelect = (option: string) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setIsSubmitted(true);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isSubmitted) {
      if (option === selectedOption) return "bg-stone-400 text-white";
      return "bg-gray-200";
    }

    if (option === correctAnswer) return "bg-green-500 text-white";
    if (option === selectedOption && selectedOption !== correctAnswer)
      return "bg-red-500 text-white";

    return "bg-gray-200";
  };

  const getOptionBorderStyle = (option: string) => {
    if (!isSubmitted) {
      if (option === selectedOption) return "border-stone-400 bg-stone-50";
      return "border-gray-200 hover:bg-stone-50";
    }

    if (option === correctAnswer) return "border-green-500 bg-green-50";
    if (option === selectedOption && selectedOption !== correctAnswer)
      return "border-red-500 bg-red-50";

    return "border-gray-200";
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="mb-4 text-xl font-medium text-gray-800">{title}</h3>
      <p className="mb-6 text-gray-700">{question}</p>

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.id}
            className={`cursor-pointer rounded-md border p-3 ${getOptionBorderStyle(option.id)}`}
            onClick={() => !isSubmitted && handleOptionSelect(option.id)}
          >
            <div className="flex items-center">
              <div
                className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full ${getOptionStyle(option.id)} text-gray-700`}
              >
                {option.id}
              </div>
              <span>{option.text}</span>
            </div>
          </div>
        ))}
      </div>

      {isSubmitted && (
        <div className="mt-4 rounded-md border border-gray-200 p-4">
          <p
            className={
              selectedOption === correctAnswer
                ? "font-medium text-green-600"
                : "font-medium text-red-600"
            }
          >
            {selectedOption === correctAnswer
              ? successMessage
              : `${failureMessage} ${correctAnswer}.`}
          </p>
          <p className="mt-2 text-gray-700">
            {selectedOption === correctAnswer
              ? correctFeedback
              : incorrectFeedback}
          </p>
        </div>
      )}

      <div className="mt-4 flex space-x-3">
        {!isSubmitted ? (
          <button
            className={`rounded-md px-4 py-2 text-white ${
              !selectedOption
                ? "cursor-not-allowed bg-gray-400"
                : "bg-stone-500 hover:bg-stone-600"
            }`}
            onClick={handleSubmit}
            disabled={!selectedOption}
          >
            Pasirinkti atsakymą
          </button>
        ) : (
          <button
            className="rounded-md bg-stone-500 px-4 py-2 text-white hover:bg-stone-600"
            onClick={resetQuiz}
          >
            Bandyti dar kartą
          </button>
        )}
      </div>
    </div>
  );
}

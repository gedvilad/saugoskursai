import { useState } from "react";

type OptionKey = "check1" | "check2" | "check3" | "check4";

type OptionState = Record<OptionKey, boolean>;

export default function RiskQuiz() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<OptionState>({
    check1: false,
    check2: false,
    check3: false,
    check4: false,
  });

  const correctAnswers: OptionState = {
    check1: false,
    check2: true,
    check3: false,
    check4: true,
  };

  const handleOptionChange = (id: OptionKey) => {
    if (!isSubmitted) {
      setSelectedOptions({
        ...selectedOptions,
        [id]: !selectedOptions[id],
      });
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const getOptionStyle = (id: OptionKey) => {
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

  const getCheckboxStyle = (id: OptionKey) => {
    if (!isSubmitted) return "border-gray-300";

    if (correctAnswers[id]) {
      return "border-green-500 bg-green-100";
    } else if (selectedOptions[id]) {
      return "border-red-500 bg-red-100";
    }

    return "border-gray-300";
  };

  const calculateScore = () => {
    let correctCount = 0;
    Object.keys(correctAnswers).forEach((key) => {
      const typedKey = key as OptionKey;
      if (selectedOptions[typedKey] === correctAnswers[typedKey]) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const totalQuestions = Object.keys(correctAnswers).length;

  const options: { id: OptionKey; text: string }[] = [
    {
      id: "check1",
      text: "Jei konteinerio tikslus svoris nežinomas, galima remtis panašių konteinerių svoriu ir pradėti kėlimą.",
    },
    {
      id: "check2",
      text: "Prieš keliant reikia patikrinti, ar konteinerio turinys yra tolygiai paskirstytas ir saugiai pritvirtintas viduje.",
    },
    {
      id: "check3",
      text: "Jei vėjo greitis viršija nustatytą ribą, kėlimo operaciją galima tęsti, bet reikia būti atsargesniems.",
    },
    {
      id: "check4",
      text: "Stropos turi būti tvirtinamos prie specialiai tam skirtų kėlimo taškų arba taip, kad būtų užtikrintas tolygus svorio pasiskirstymas.",
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="mb-4 text-xl font-medium text-gray-800">
        Praktinė užduotis: Rizikos vertinimas
      </h3>
      <p className="mb-4 text-gray-700">
        Įsivaizduokite, kad ruošiatės kelti metalinį konteinerį. Patikrinkite,
        kurie teiginiai yra teisingi:
      </p>

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
              className={`ml-2 text-gray-700 ${
                !isSubmitted && "cursor-pointer"
              }`}
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
            Jūsų rezultatas: {calculateScore()} iš {totalQuestions}
          </p>
          <div className="mt-2 text-gray-700">
            <p className="mb-2 font-medium">Paaiškinimai:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li className="text-red-600">
                1 teiginys - NETEISINGAS. Niekada nepradėkite kėlimo operacijos
                nežinodami tikslaus svorio. Tai yra pavojinga.
              </li>
              <li className="text-green-600">
                2 teiginys - TEISINGAS. Svarbu patikrinti, ar krovinys tinkamai
                paskirstytas, kad išvengtumėte netolygaus svorio ir galimo
                apsivertimo.
              </li>
              <li className="text-red-600">
                3 teiginys - NETEISINGAS. Jei vėjo greitis viršija nustatytą
                ribą, kėlimo operacija turi būti sustabdyta, ne tik vykdoma
                atsargiau.
              </li>
              <li className="text-green-600">
                4 teiginys - TEISINGAS. Stropos turi būti tvirtinamos tik prie
                specialiai tam skirtų taškų, kad būtų užtikrintas saugus
                kėlimas.
              </li>
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

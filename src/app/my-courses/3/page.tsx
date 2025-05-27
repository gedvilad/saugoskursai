"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import EmergencyScenarioQuiz from "~/app/_components/_safeRiggingCourse/SingleChoiceQuiz";
import RiskQuiz from "~/app/_components/_safeRiggingCourse/RiskQuiz";
import SingleChoiceQuiz from "~/app/_components/_safeRiggingCourse/SingleChoiceQuiz";
import DragDropQuiz from "~/app/_components/_safeRiggingCourse/dragDropQuiz";
import ImageDragDropQuiz from "~/app/_components/_safeRiggingCourse/imageDragDropQuiz";
import MultiCheckQuiz from "~/app/_components/_safeRiggingCourse/RiskQuiz";

interface Test {
  id: number;
  name: string;
}
interface ApiResponse {
  test: Test;
  message: string;
}

interface ApiResponseValidateAccess {
  accessStatus: string;
  message: string;
}
export default function CourseDetail() {
  const { userId } = useAuth();
  const router = useRouter();
  //const params = useParams();
  //const id = Number(params.id);
  const courseId = 3;
  const searchParams = useSearchParams();
  const assignedCourseId = Number(searchParams.get("assignedId"));
  console.log("assignedCourseId", assignedCourseId);
  const requestType = searchParams.get("request");
  // State for interactive elements
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Interactive task state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        const res = await fetch(
          `/api/courses/validateAccess?courseId=${courseId}&userId=${userId}&requestedCourseId=${assignedCourseId}&requestType=${requestType}`,
        );
        const data = (await res.json()) as ApiResponseValidateAccess;

        if (!res.ok) {
          toast.error(data.message);
          router.push("/");
          return;
        }
        setIsLoading(false);
        console.log("Access granted:", data.accessStatus);
        // handle accessStatus here
      } catch (err) {
        console.error("Validation error:", err);
        toast.error("Įvyko klaida tikrinant prieiga");
      }
    };

    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/courses/courseTest?courseId=${courseId}`);
        const data = (await res.json()) as ApiResponse;
        if (!res.ok) {
          toast.error(data.message);
          return;
        } else {
          setTest(data.test);
        }
      } catch (error) {
        console.error("Error fetching test:", error);
      }
    };

    if (!userId) return;
    // if (!requestType) {
    //   toast.error("Neturite prieigos prie kurso medžiagos");
    //   router.push("/");
    //   return;
    // }
    validateAccess().catch((error) =>
      console.error("Error validating access:", error),
    );
    fetchTest().catch((error) => console.error("Error fetching test:", error));
  }, [courseId, userId, requestType]);

  // Handle quiz answer selection
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowFeedback(true);
  };

  // Handle drag start
  const handleDragStart = (item: string) => {
    setDraggedItem(item);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem && !completedItems.includes(draggedItem)) {
      setCompletedItems([...completedItems, draggedItem]);
      setDraggedItem(null);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Navigate to test
  const handleTakeTest = () => {
    if (test === null) {
      //toast.error("Nepavyko rasti testo ID");
      return;
    }
    router.push(
      `/testai/${test?.id}?assignedId=${assignedCourseId}&courseId=${courseId}`,
    );
  };
  const emergencyQuizData = {
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
  };
  const quizData1 = {
    title: "Patikrinkite savo žinias",
    question: "Kas nėra rigerio atsakomybė?",
    options: [
      {
        id: "A",
        text: "Signalų perdavimas krano operatoriui",
      },
      {
        id: "B",
        text: "Krovinio stropavimas",
      },
      {
        id: "C",
        text: "Tiesioginis krano valdymas",
      },
      {
        id: "D",
        text: "Darbo zonos stebėjimas ir saugumo joje užtikrinimas",
      },
    ],
    correctAnswer: "C",
    correctFeedback: "",
    incorrectFeedback: "Už krano valdymą atsakingas krano operatorius.",
    successMessage: "Teisingai! Už krano valdymą atsakingas krano operatorius.",
    failureMessage: "Neteisingas atsakymas. Teisingas atsakymas yra",
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Course Header */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <div className="mb-2 h-2 bg-stone-500"></div>
            <h1 className="text-3xl font-bold text-gray-800">
              Taisyklingas krovinių kelimas su kranu
            </h1>
            <p className="mt-2 text-gray-600">
              Šiame kurse išmoksite esmines taisykles dirbat su kranais, rizikos
              vertinimą ir tinkamas stropuotojo pareigų atlikimo procedūras.
            </p>
          </div>

          {/* Integrated Course Content */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Pagrindinės stropuotojo pareigos ir atsakomybės
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Stropuotojas yra atsakingas už saugų krovinių prikabinimą,
                nukreipimą ir perkėlimą nurodant krovinio kryptį ženklais krano
                operatoriui. Štai pagrindinės stropuotojo atsakomybės:
              </p>
              <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                <li>
                  <strong>Darbo zonos stebėjimas</strong>
                </li>
                <p>
                  - Krovinių kėlimo vieta ir visa kėlimo kranų darbo zona turi
                  būti gerai apšviesta. Kai kėlimo krano darbo zonos apšvietimas
                  nėra pakankamas (tamsus paros metas, tirštas rūkas, stiprus
                  lietus, snygis bei kt.) ir kranininkas negali aiškiai matyti
                  stropuotojo duodamų signalų arba krovinio, kėlimo krano darbas
                  sustabdomas.
                </p>
                <p>
                  - Kėlimo krano veikimo zonos turi būti pažymėtos
                  įspėjamaisiais ženklais ir užtikrinta, kad jose nebūtų
                  pašalinių asmenų atliekant krovinių kėlimo darbus.
                </p>
                <p>
                  - Prieš keliant krovinį ir viso krovinio judėjimo metu
                  užtikrinti, kad nėra pašalinių kliučių galinčių kliudyti
                  krovinį ir/ar kraną.
                </p>
                <li>
                  <strong>Krovinio patikrinimas</strong>
                </li>
                <p>- Įvertinti krovinio svorį, formą ir svorio centrą.</p>
                <p>- Įsitikinti, kad krovinis yra stabilus, neapgadintas.</p>
                <p>
                  - Nekabinti krovinių, kurių svoris didesnis už kėlimo krano
                  keliamąją galią.
                </p>
                <p>
                  - Patikrinti stropavimo teisingumą, kranininkui krovinį
                  pakėlus į 0,2 - 0,3 m aukštį
                </p>
                <li>
                  <strong>Įrangos parinkimas</strong>
                </li>
                <p>
                  - Įvertinus krovinį pasirinkti tinkamus stropus, grandines ir
                  stropavimo būdą.
                </p>
                <li>
                  <strong>Įrangos patikrinimas</strong>
                </li>
                <p>
                  - Prieš pradėdamas darbą su kėlimo kranu, apžiūrėti ir
                  patikrinti kėlimo reikmenų ženklinimą, jų techninę būklę.
                </p>
                <li>
                  <strong>Signalizavimas</strong>
                </li>
                <p>
                  - Krovinio kėlimo metu perduoti aiškius signalus krano
                  operatoriui, kol krovinys bus saugiai padėtas.
                </p>
                <li>
                  <strong>Stropuotojui draudžiama</strong>
                </li>
                <p>
                  - Būti prie dirbančio strėlinio ar bokštinio kėlimo krano, kur
                  galima patekti tarp sukamųjų ir nejudamųjų kėlimo krano dalių
                  arba sukamųjų kėlimo krano dalių ir kitų nejudamų daiktų
                  (krovinių, statinių, įrenginių ir kitų).
                </p>
                <p>
                  - Leisti kelti užpiltus žemėmis ar prišalusius, apkrautus
                  kitais kroviniais, pritvirtintus varžtais, užpiltus betonu
                  krovinius arba kitaip prie nekeliamo pagrindo pritvirtintus
                  krovinius;
                </p>
                <p>
                  - Nukreipti keliamą ar perkeliamą krovinį savo svoriu ir
                  taisyti netinkamai uždėtus stropus esant pakeltam kroviniui.
                </p>
              </ul>

              {/* Image integrated with theory */}
              {/* <div className="mb-8 overflow-hidden rounded-lg bg-gray-50 shadow-md">
                <div className="relative h-64 w-full">
                  <Image
                    src="/api/placeholder/800/500"
                    alt="Rigerio rankiniai signalai"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-center text-sm text-gray-600">
                    Standartiniai rigerio rankiniai signalai krano operatoriui
                  </p>
                </div>
              </div> */}

              {/* Interactive Quiz after theory and image */}
              <SingleChoiceQuiz quizData={quizData1} />
            </div>
            <div className="mb-6 h-px bg-gray-200"></div>

            {/* Second section with different content types */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Automobilinio kėlimo krano pastatymas
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Prieš atliekant bet kokius kėlimo darbus reikalinga taisyklingai
                pastatyti kraną.
              </p>
              <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                <li>
                  Kėlimo krano savininkas ir kiti asmenys, atliekantys
                  montavimo, demontavimo ir kitus darbus su kėlimo kranu, turi
                  vadovautis gamintojo techniniuose dokumentuose nustatytais
                  reikalavimais
                </li>
                <li>
                  Turi būti saugūs atstumai nuo inžinerinių tinklų, elektros
                  tinklų ir elektros perdavimo linijų, miesto transporto ir
                  pėsčiųjų judėjimo vietų, nepavojingi kėlimo krano priartėjimo
                  prie
                </li>
                <li>
                  Norint montuoti kėlimo kranus statiniuose (ant statinio
                  konstrukcijų), reikia numatyti ir apskaičiuoti, kokį poveikį
                  jie turės statinio konstrukcijoms, ypač kai jie bus bandomi su
                  bandomuoju kroviniu arba naudojant specialų bandymo įtaisą.
                </li>
                <li>
                  Kėlimo kranai turi būti sumontuoti taip, kad pakeltas krovinys
                  būtų gabenamas ne žemiau kaip 0,5 m virš statinio, įrenginių,
                  krovinių rietuvių, automobilių bortų ir kitų daiktų.
                </li>
                <li>
                  Kranininkui, valdančiam kėlimo kraną nuo žemės, turi būti
                  paliktas praėjimo takas. Kranininkui, valdančiam kėlimo kraną
                  iš kabinos, turi būti paliktas saugus laisvas praėjimas
                  patekti į kabiną. Jeigu reikia, turi būti įrengti avariniai
                  evakuaciniai išėjimai bei įrengiami kėlimo krano remontui
                  skirti praėjimai, aikštelės ir laiptai. Praėjimo plotis turi
                  būti ne mažesnis kaip 0,5 m, jo aukštis nuo pagrindo iki
                  žemiausiai išsikišusių daiktų – ne mažesnis kaip 1,8 m.
                  Įlipimo laiptai turi būti neslidūs, pasvirę į horizontalę ne
                  didesniu kaip 60°–75° kampu, su turėklais. Turi būti numatyta
                  išvengti prispaudimo pavojaus tarp judančių kėlimo krano dalių
                  ir nejudančių konstrukcijų, skirtų įlipimui į kabiną. Visos
                  durys, liukai ir kiti elementai, dėl kurių netikėto atidarymo
                  gali kilti pavojus, turi būti su automatiniais blokavimo
                  įtaisais. Mechaninės durys ir vartai turi funkcionuoti taip,
                  kad nekeltų pavojaus darbuotojams. Jų avarinio atidarymo ir
                  uždarymo įtaisai turi būti tinkamai pažymėti ir lengvai
                  randami. Kai nutrūkus elektros energijos tiekimui mechaninės
                  durys ir vartai lieka uždaryti, turi būti galimybė juos
                  atidaryti rankomis.
                </li>
              </ul>
            </div>
            <div className="mb-6 h-px bg-gray-200"></div>
            {/* Second section with different content types */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Signalizavimas krano operatoriui
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Norint komunikuoti su krano operatoriumi, būtina žinoti signalus
                ir jų reikšmes
              </p>
            </div>
            {/* Image integrated with theory */}
            <div className="mb-8 overflow-hidden rounded-lg bg-gray-50 shadow-md">
              <div className="relative h-[600px] w-full">
                <Image
                  src="/images/stropuotoju-signalai.png"
                  alt="Stropuotojo rankiniai signalai"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-4">
                <p className="text-center text-sm text-gray-600">
                  Standartiniai stropuotojo rankiniai signalai krano operatoriui
                </p>
              </div>
            </div>
            <ImageDragDropQuiz />
            <div className="mb-6 h-px bg-gray-200"></div>

            {/* Second section with different content types */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Kėlimo įrangos patikrinimas ir naudojimas
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Prieš pradedant darbą su kėlimo įranga, būtina atlikti išsamų
                kėlimo įrangos patikrinimą.
              </p>

              {/* Video integrated within the content */}
              {/* <div className="mx-auto mb-8 max-w-3xl overflow-hidden rounded-lg shadow-lg">
                <div className="relative aspect-video w-full bg-black">
                  <Image
                    src="/api/placeholder/1280/720"
                    alt="Video thumbnail"
                    fill
                    className="object-cover"
                  />
                  {!isVideoPlaying && (
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-stone-500 bg-opacity-80 text-white transition-colors hover:bg-stone-600"
                    >
                      <svg
                        className="h-8 w-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Kėlimo įrangos patikrinimas: žingsnis po žingsnio
                  </h3>
                </div>
              </div> */}

              <ol className="mb-6 list-inside list-decimal space-y-2 text-gray-700">
                <li>
                  <strong>Stropai ir grandinės</strong> - patikrinti, ar nėra
                  nusidėvėjimo, įtrūkimų ar deformacijų.
                </li>
                <li>
                  <strong>Kabliai</strong> - įsitikinti, kad kablių apsauginės
                  sklendės veikia tinkamai.
                </li>
                <li>
                  <strong>Jungimo įranga</strong> - patikrinti, ar visos
                  jungtys, varžtai ir kaiščiai yra tinkamai įtvirtinti.
                </li>
                <li>
                  <strong>Apkrovos žymėjimai</strong> - įsitikinti, kad visa
                  įranga turi aiškiai matomus apkrovos žymėjimus.
                </li>
              </ol>

              {/* Image illustrating concepts */}
              <div className="mb-8 overflow-hidden rounded-lg bg-gray-50 shadow-md">
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[800px]">
                  <Image
                    src="/images/pazeistas-stropas.png"
                    alt="Stropų pažeidimai"
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 640px) 100vw, 800px"
                  />
                </div>
                <div className="p-4">
                  <p className="text-center text-sm text-gray-600">
                    Dažniausi stropų pažeidimai, dėl kurių įranga neturėtų būti
                    naudojama
                  </p>
                </div>
              </div>

              {/* Interactive Drag and Drop */}
              <DragDropQuiz />
            </div>

            <div className="mb-6 h-px bg-gray-200"></div>

            {/* Third section with additional content */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Krovinių apžiūra ir rizikos vertinimas
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Kiekvienas krovinys yra unikalus ir reikalauja atidaus vertinimo
                prieš kėlimą. Stropuotojas turi sugebėti įvertinti galimas
                rizikas ir pavojus.
              </p>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Svorio įvertinimas
                  </h3>
                  <p className="text-gray-700">
                    Nustatyti tikslų krovinio svorį pagal dokumentaciją arba
                    apskaičiuoti jį naudojant objekto matmenis ir medžiagos
                    tankį.
                  </p>
                </div>

                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Svorio centro nustatymas
                  </h3>
                  <p className="text-gray-700">
                    Identifikuoti krovinio svorio centrą, kad būtų galima
                    tinkamai jį pritvirtinti ir išvengti nestabilumo kėlimo
                    metu.
                  </p>
                </div>

                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Krovinio forma ir stabilumas
                  </h3>
                  <p className="text-gray-700">
                    Įvertinti, ar krovinys yra stabilus, ar turi nestabilių
                    elementų, kurie gali pakrypti arba nukristi kėlimo metu.
                  </p>
                </div>

                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Aplinkos sąlygos
                  </h3>
                  <p className="text-gray-700">
                    Įvertinti vėjo greitį, matomumą ir kitus aplinkos faktorius,
                    kurie gali paveikti kėlimo operacijos saugumą.
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Smulkūs kroviniai
                  </h3>
                  <p className="text-gray-700">
                    Smulkūs kroviniai turi būti keliami bei perkeliami
                    specialioje taroje ir sukrauti taip, kad neiškristų.
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Kranų kabliai
                  </h3>
                  <p className="text-gray-700">
                    Kėlimo kranų kabliai turi būti tokie, kad krovinys negalėtų
                    savaime atsikabinti.
                  </p>
                </div>
              </div>

              {/* Image related to load inspection */}
              {/* <div className="mb-8 overflow-hidden rounded-lg bg-gray-50 shadow-md">
                <div className="relative h-64 w-full">
                  <Image
                    src="/api/placeholder/800/500"
                    alt="Svorio centro žymėjimas"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-center text-sm text-gray-600">
                    Krovinio svorio centro identifikavimas ir stropos tvirtinimo
                    taškai
                  </p>
                </div>
              </div> */}

              {/* Simple interactive task */}
              <MultiCheckQuiz
                title="Praktinė užduotis: Rizikos vertinimas"
                description="Įsivaizduokite, kad ruošiatės kelti metalinį konteinerį. Patikrinkite, kurie teiginiai yra teisingi:"
                options={[
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
                ]}
                correctAnswers={{
                  check1: false,
                  check2: true,
                  check3: false,
                  check4: true,
                }}
                explanations={{
                  check1:
                    "Niekada nepradėkite kėlimo operacijos nežinodami tikslaus svorio. Tai yra pavojinga.",
                  check2:
                    "Svarbu patikrinti, ar krovinys tinkamai paskirstytas, kad išvengtumėte netolygaus svorio ir galimo apsivertimo.",
                  check3:
                    "Jei vėjo greitis viršija nustatytą ribą, kėlimo operacija turi būti sustabdyta, ne tik vykdoma atsargiau.",
                  check4:
                    "Stropos turi būti tvirtinamos tik prie specialiai tam skirtų taškų, kad būtų užtikrintas saugus kėlimas.",
                }}
              />
            </div>

            <div className="mb-6 h-px bg-gray-200"></div>

            {/* Fourth section: Emergency procedures */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Avarines situacijos ir veiksmai
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Stropuotojas turi žinoti, kaip elgtis avarinių situacijų metu.
                Greiti ir tinkami sprendimai gali išvengti rimtų nelaimingų
                atsitikimų.
              </p>

              <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
                <h3 className="mb-2 font-semibold">
                  SVARBU: Avarinės situacijos išvengimas
                </h3>
                <ul className="list-inside list-disc space-y-1">
                  <li>Niekada nestovėkite po kabančiu kroviniu.</li>
                  <li>
                    Visada turėkite aiškų pasitraukimo nuo krovinio kelią.
                  </li>
                  <li>
                    Įsitikinkite, kad darbų zonoje nebūtų pašalinių asmenų ir
                    kliučių.
                  </li>
                  <li>Nestovėkite po automobilinio krano svoriu.</li>
                </ul>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border-l-4 border-l-yellow-500 bg-yellow-50 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Krovinio nestabilumo požymiai
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    <li>Neįprastas krovinio svyravimas</li>
                    <li>Stropų įtempimo netolygumas</li>
                    <li>Garsai, įspėjantys apie krovinio dalių judėjimą</li>
                    <li>Krovinio pasvyrimas</li>
                  </ul>
                </div>

                <div className="rounded-md border-l-4 border-l-blue-500 bg-blue-50 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Veiksmai, pastebėjus nestabilumą
                  </h3>
                  <ol className="list-inside list-decimal space-y-1 text-gray-700">
                    <li>Duoti signalą operatoriui sustoti</li>
                    <li>Evakuoti žmones iš pavojingos zonos</li>
                    <li>Jei įmanoma, nuleisti krovinį</li>
                    <li>Pranešti atsakingam asmeniui apie situaciją</li>
                    <li>Jei įmanoma aptverti atsiradusias pavojingas zonas.</li>
                  </ol>
                </div>
              </div>

              <div className="mb-8 overflow-hidden rounded-lg bg-gray-50 shadow-md">
                <div className="relative mx-auto aspect-[1000/350] w-full max-w-[1000px]">
                  <Image
                    src="/images/avarine-situacija.png"
                    alt="Avarinė situacija"
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 640px) 100vw, 1000px"
                  />
                </div>
                <div className="p-4">
                  <p className="text-center text-sm text-gray-600">
                    Avarinė situacija
                  </p>
                </div>
              </div>

              {/* Interactive scenario */}
              <SingleChoiceQuiz quizData={emergencyQuizData} />
            </div>
          </div>

          {/* Test Button */}
          {requestType === "assigned" && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleTakeTest}
                className="group flex items-center rounded-md bg-stone-500 px-6 py-3 text-white transition-all duration-300 hover:bg-stone-600 hover:shadow-lg"
              >
                <svg
                  className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Laikyti kurso testą
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

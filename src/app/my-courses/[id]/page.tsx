"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

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
  const params = useParams();
  const id = Number(params.id);
  const courseId = id;
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
          `/api/courses/validateAccess?userId=${userId}&requestedCourseId=${assignedCourseId}&requestType=${requestType}`,
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
    if (!requestType) {
      toast.error("Neturite prieigos prie kurso medžiagos");
      router.push("/");
      return;
    }
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
    router.push(`/testai/${test?.id}?assignedId=${assignedCourseId}`);
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
              Taisyklingas krovinių kelimas
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
                <li>
                  <strong>Įrangos parinkimas</strong>
                </li>
                <p>
                  - Įvertinus krovinį pasirinkti tinkamus stropus, grandines ir
                  stropavimo būdą.
                </p>
                <li>
                  <strong>Signalizavimas</strong>
                </li>
                <p>
                  - Krovinio kėlimo metu perduoti aiškius signalus krano
                  operatoriui, kol krovinys bus saugiai padėtas.
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
              <div className="mb-8 rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-xl font-medium text-gray-800">
                  Patikrinkite savo žinias
                </h3>
                <p className="mb-4 text-gray-700">
                  Kas nėra rigerio atsakomybė?
                </p>

                <div className="space-y-2">
                  {[
                    "Signalų perdavimas krano operatoriui",
                    "Krano mechaninių dalių remontas",
                    "Darbo zonos stebėjimas",
                    "Tinkamų stropų parinkimas",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full rounded-md border p-3 text-left transition-colors ${
                        selectedOption === option
                          ? selectedOption === "Krano mechaninių dalių remontas"
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {showFeedback && (
                  <div
                    className={`mt-4 rounded-md p-4 ${
                      selectedOption === "Krano mechaninių dalių remontas"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedOption === "Krano mechaninių dalių remontas"
                      ? "Teisingai! Krano mechaninių dalių remontas yra techninio personalo, ne rigerio atsakomybė."
                      : `Neteisingai. Teisingas atsakymas yra "Krano mechaninių dalių remontas". Tai yra techninio personalo, ne rigerio atsakomybė.`}
                  </div>
                )}
              </div>
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
              <div className="mx-auto mb-8 max-w-3xl overflow-hidden rounded-lg shadow-lg">
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
              </div>

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
                <div className="relative h-64 w-full">
                  <Image
                    src="/api/placeholder/800/500"
                    alt="Stropų pažeidimai"
                    fill
                    className="object-cover"
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
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-xl font-medium text-gray-800">
                  Sudėliokite kėlimo įrangos patikrinimo veiksmus tinkama tvarka
                </h3>

                <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                  {/* Draggable items */}
                  <div className="flex-1">
                    <h4 className="mb-2 text-lg font-medium text-gray-700">
                      Veiksmai:
                    </h4>
                    <div className="space-y-2">
                      {[
                        "Atlikti vizualinį patikrinimą",
                        "Patikrinti apkrovos žymėjimus",
                        "Užpildyti patikros dokumentus",
                        "Pranešti apie problemas vadovui",
                      ].map((item) => (
                        <div
                          key={item}
                          draggable={!completedItems.includes(item)}
                          onDragStart={() => handleDragStart(item)}
                          className={`cursor-grab rounded-md p-3 transition-colors ${
                            completedItems.includes(item)
                              ? "bg-gray-100 text-gray-400"
                              : "border border-stone-300 bg-white hover:bg-stone-50"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drop area */}
                  <div className="flex-1">
                    <h4 className="mb-2 text-lg font-medium text-gray-700">
                      Teisinga tvarka:
                    </h4>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="min-h-40 rounded-md border-2 border-dashed border-stone-300 bg-stone-50 p-4"
                    >
                      {completedItems.length > 0 ? (
                        <div className="space-y-2">
                          {completedItems.map((item, index) => (
                            <div
                              key={item}
                              className="rounded-md bg-stone-200 p-3"
                            >
                              {index + 1}. {item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">
                          Vilkite veiksmus čia
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="mb-8 overflow-hidden rounded-lg bg-gray-50 shadow-md">
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
              </div>

              {/* Simple interactive task */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-xl font-medium text-gray-800">
                  Praktinė užduotis: Rizikos vertinimas
                </h3>
                <p className="mb-4 text-gray-700">
                  Įsivaizduokite, kad ruošiatės kelti metalinį konteinerį.
                  Patikrinkite, kurie teiginiai yra teisingi:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="check1"
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="check1" className="ml-2 text-gray-700">
                      Jei konteinerio tikslus svoris nežinomas, galima remtis
                      panašių konteinerių svoriu ir pradėti kėlimą.
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="check2"
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="check2" className="ml-2 text-gray-700">
                      Prieš keliant reikia patikrinti, ar konteinerio turinys
                      yra tolygiai paskirstytas ir saugiai pritvirtintas viduje.
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="check3"
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="check3" className="ml-2 text-gray-700">
                      Jei vėjo greitis viršija nustatytą ribą, kėlimo operaciją
                      galima tęsti, bet reikia būti atsargesniems.
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="check4"
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="check4" className="ml-2 text-gray-700">
                      Stropos turi būti tvirtinamos prie specialiai tam skirtų
                      kėlimo taškų arba taip, kad būtų užtikrintas tolygus
                      svorio pasiskirstymas.
                    </label>
                  </div>
                </div>

                <button className="mt-4 rounded-md bg-stone-500 px-4 py-2 text-white hover:bg-stone-600">
                  Patikrinti atsakymus
                </button>
              </div>
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
                  </ol>
                </div>
              </div>

              {/* Image related to emergency procedures */}
              <div className="mb-8 overflow-hidden rounded-lg bg-gray-50 shadow-md">
                <div className="relative h-64 w-full">
                  <Image
                    src="/api/placeholder/800/500"
                    alt="Avarinės situacijos schema"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-center text-sm text-gray-600">
                    Evakuacijos zonos ir saugūs atstumai krano darbų metu
                  </p>
                </div>
              </div>

              {/* Interactive scenario */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-xl font-medium text-gray-800">
                  Avarinis scenarijus: Ką daryti?
                </h3>
                <p className="mb-6 text-gray-700">
                  Jūs dirbate kaip rigeris ir pastebite, kad keliant sunkų
                  metalo lakštą, viena stropa pradeda slysti. Krovinys dar nėra
                  pakeltas aukštai. Pasirinkite teisingą veiksmų seką:
                </p>

                <div className="space-y-3">
                  <div className="cursor-pointer rounded-md border border-gray-200 p-3 hover:bg-stone-50">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                        A
                      </div>
                      <span>
                        Bandyti pataisyti stropą, kol krovinys kabo, kad
                        išvengtumėte operacijos nutraukimo.
                      </span>
                    </div>
                  </div>

                  <div className="cursor-pointer rounded-md border border-gray-200 p-3 hover:bg-stone-50">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                        B
                      </div>
                      <span>
                        Signalizuoti operatoriui nedelsiant sustoti, įspėti
                        darbuotojus pasišalinti ir nuleisti krovinį ant žemės.
                      </span>
                    </div>
                  </div>

                  <div className="cursor-pointer rounded-md border border-gray-200 p-3 hover:bg-stone-50">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                        C
                      </div>
                      <span>
                        Duoti signalą operatoriui skubiai užbaigti kėlimą, kad
                        krovinys būtų greičiau nuleistas į galutinę vietą.
                      </span>
                    </div>
                  </div>

                  <div className="cursor-pointer rounded-md border border-gray-200 p-3 hover:bg-stone-50">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                        D
                      </div>
                      <span>
                        Paprašyti kito darbuotojo palaikyti krovinį, kol pats
                        pataisysite stropą.
                      </span>
                    </div>
                  </div>
                </div>

                <button className="mt-4 rounded-md bg-stone-500 px-4 py-2 text-white hover:bg-stone-600">
                  Pasirinkti atsakymą
                </button>
              </div>
            </div>
          </div>

          {/* Test Button */}
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
        </div>
      </main>
    </div>
  );
}

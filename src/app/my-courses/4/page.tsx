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
import CategorizeQuiz from "~/app/_components/_safeRiggingCourse/categorizeQuiz";
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
export default function ForkLiftCourseDetail() {
  const { userId } = useAuth();
  const router = useRouter();
  //const params = useParams();
  //const id = Number(params.id);
  const courseId = 4;
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
  const validQuizData = {
    title: "Kaip išvengti avarinės situacijos?",
    question:
      "Ką daryti, jei krovinys krautuvu pakrautas tik ant vienos šakės ir riboja matomumą?",
    options: [
      { id: "A", text: "Toliau važiuoti, bet labai atsargiai." },
      { id: "B", text: "Nuleisti krovinį ir jį tinkamai paskirstyti." },
      { id: "C", text: "Paprašyti kolegos palaikyti krovinį." },
      { id: "D", text: "Palenkti stovą į priekį ir užvažiuoti ant rampos." },
    ],
    correctAnswer: "B",
    correctFeedback:
      "Teisingai! Visada reikia sustoti ir saugiai paskirstyti krovinį.",
    incorrectFeedback:
      "Tai nesaugus sprendimas. Krovinį reikia paskirstyti tolygiai ir neužstojant matomumo.",
    successMessage: "Puikiai atlikta!",
    failureMessage: "Bandykite dar kartą.",
  };

  const dragDropQuizData = {
    title: "Sudėliokite ",
    actions: [
      "Atlikti vizualinį patikrinimą",
      "Patikrinti apkrovos žymėjimus",
      "Užpildyti patikros dokumentus",
      "Pranešti apie problemas vadovui",
    ],
    correctOrderIndexes: [0, 1, 3, 2],
    instructionsText: "Vilkite veiksmus čia",
    actionsLabel: "Veiksmai:",
    orderLabel: "Teisinga tvarka:",
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
              Taisyklingas šakinio krautuvo valdymas ir krovinių
              transportavimas.
            </h1>
            <p className="mt-2 text-gray-600">
              Šiame kurse išmoksite esmines taisykles dirbat su šakiniu
              krautuvu, rizikos vertinimą, kaip tinkamai valdyti šakinį krautuvą
              ir su juo kelti krovinius.
            </p>
          </div>

          {/* Integrated Course Content */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Reikalavimai šakinio krautuvo vairuotojui
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700"></p>
              <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                <li>
                  <strong>Vyresnis kaip 18 metų</strong>
                </li>
                <li>
                  <strong>Apmokytas teoriškai ir praktiškai</strong>
                </li>
                <li>
                  <strong>Sėkmingai išlaikęs vairavimo egzaminą</strong>
                </li>
                <li>
                  <strong>Darbdavio įgaliotas vairuoti krautuvą</strong>
                </li>
                <li>
                  <strong>
                    Jei įmanoma, turėti įmonės vidaus transporto vairavimo
                    pažymėjimą. Tinkamumą vairuoti šakinį krautuvą turi
                    nustatyti darbo medikas.
                  </strong>
                </li>
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
            </div>
            <div className="mb-6 h-px bg-gray-200"></div>

            {/* Second section with different content types */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Reikalavimai šakiniam krautuvui
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Jeigu kroviniai sudėti taip aukštai, kad gali nukristi ant
                vairuotojo, šakiniame krautuve įrengiamas vairuotojo apsauginis
                stogelis Ir, jeigu kraunami maži kroviniai, papildomai krovinių
                apsauginis tinklelis.
              </p>
              <p className="mb-4 text-gray-700">
                Kiekvienas šakinis krautuvas turi:
              </p>

              <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                <li>pakankamai pamatuotus naudojimo ir fiksavimo stabdžius</li>
                <li>galimybę apsaugoti nuo nenumatyto naudojimo</li>
                <li>
                  Su elektros pavara – užvedimo raktelį, su vidaus degimo
                  variklio pavara – paleidimo jungiklį su ištraukiamu saugos
                  rakteliu
                </li>
                <li>garsinį įspėjamąjį įrenginį, pvz., signalą</li>
                <li>
                  sėdynę ir galimybę kartu važiuojantiems tvirtai laikytis, jei
                  jie turi važiuoti kartu
                </li>
                <li>
                  kėlimo stovą, užtikrinantį pakankamą kelių, krovinio ir kėlimo
                  reikmenų matomumą
                </li>
                <li>
                  valdymo vieta, kuri nuo vairuotojo sėdynės lengvai pasiekiama
                  ir vienareikšmiai paženklinta
                </li>
              </ul>
            </div>
            <div className="mb-6 h-px bg-gray-200"></div>
            {/* Second section with different content types */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Šakinio krautuvo vairuotoją veikiančios apkrovos
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700"></p>
              <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                <li>
                  <strong>Oro tarša</strong>
                </li>
                <p>
                  - Dyzeliniai krautuvai išskiria kenksmingas medžiagas – CO,
                  CO₂, NOx, SO₂, angliavandenilius ir suodžius, kurie gali
                  sukelti plaučių vėžį. Todėl jų naudojimas uždarose patalpose
                  ribojamas arba leidžiamas tik su suodžių filtrais (≥70%
                  atskyrimas). Saugesnė alternatyva – elektriniai arba
                  Otto-varikliu varomi krautuvai (su katalizatoriumi).
                </p>
                <li>
                  <strong>Vibracijos</strong>
                </li>
                <p>
                  - Vairuotojo sveikatai kenkia vibracijos, jei sėdynė nėra
                  ergonomiška. Svarbu, kad ji būtų pritaikyta pagal vairuotojo
                  kūno formą ir svorį.
                </p>
                <li>
                  <strong>Triukšmas</strong>
                </li>
                <p>
                  - Krautuvai ir aplinkiniai įrenginiai gali sukelti pavojingą
                  triukšmą. Jei vairuotojas daugiau nei 5 min. per dieną dirba
                  triukšmingose zonose (pvz., dirbtuvėse), būtinos klausos
                  apsaugos priemonės. Jos turi apsaugoti klausą, bet leisti
                  girdėti svarbius signalus.
                </p>
                <li>
                  <strong>Prevencijos</strong>
                </li>
                <p>
                  - Reikia naudoti kokybiškus degalus, trumpinti variklio
                  veikimo laiką, prižiūrėti įrenginius, gerai vėdinti patalpas
                  ir taikyti asmenines apsaugos priemones.
                </p>
              </ul>
            </div>

            {/* Second section with different content types */}
            <div className="mb-6 h-px bg-gray-200"></div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Ką reikia patikrinti prieš darbo pradžią
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Prieš pradedant darbą su krautuvu, būtina įvertinti krautuvo
                buklę ir tinkamumą darbui.
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
                  <strong>Krautuvą bendrai</strong>
                </li>
                <p>- krautuvo pažeidimus (nuotėkį, kėbulą)</p>
                <p>
                  - pavarą (pagal konstrukciją, pvz., aušinimo skystį, variklio
                  tepalą, akumuliatorių)
                </p>
                <p>
                  - apšvietimą, stop-signalo šviesą, - įspėjamuosius įrenginius
                </p>
                <li>
                  <strong>Važiuoklę specialiai</strong>
                </li>
                <p> - padangas (pažeidimus, svetimkūnius, oro slėgį),</p>
                <p> - naudojimo ir fiksavimo stabdžius</p>
                <p> - pedalų šiurkštumą (neslidumą)</p>
                <p>
                  - valdymą (laisva vairo eiga daugiausia dviejų pirštų pločio)
                </p>
                <li>
                  <strong>Kėlimo įrenginius</strong>
                </li>
                <p>
                  - krovinių paėmimo priemonių valdymą (pilną iškėlimą,
                  atkreipti dėmesį į valdymą)
                </p>
                <p>
                  - hidraulinės sistemos veikimą (užpildymo hidrauliniu skysčiu
                  būklę, neleisti sumažėti iki nulinės padėties)
                </p>
                <p>- šakių peilius (būklę, tvirtinimą)</p>
                <p>- grandines (pakankamas ir tolygus įtempimas)</p>
                <li>
                  <strong>Papildomus įrenginius</strong>
                </li>
                <p>- vairuotojo apsauginį stogelį (pažeidimus, tvirtinimą)</p>
                <p>- krovinių apsauginį tinklelį (tvirtinimą)</p>
                <p>
                  - išmetamųjų dujų valymą (keisti skysčius, valyti filtrus)
                </p>
                <p> - prikabinamuosius įrenginius</p>
              </ol>
              <p>
                <strong>
                  Nustačius pažeidimus nedelsiant reikalauti neatidėliotinos
                  pagalbos!
                </strong>
              </p>
              <p>
                Visada laikomasi šių taisyklių: pastebėjus trūkumą – nevažiuoti,
                nedelsiant pranešti ir nebandyti taisyti pačiam. Remonto,
                priežiūros ir keitimo darbus atlieka tik kvalifikuoti
                specialistai. Krautuvai tikrinami pagal poreikį, bet ne rečiau
                kaip kartą per metus, o patikras atlieka gamintojo ar tiekėjo
                specialistai arba tam apmokyti įmonės darbuotojai. Atliktą
                patikrą žymi aiškiai matoma etiketė ant krautuvo.
              </p>

              {/* Interactive Drag and Drop */}
              <CategorizeQuiz
                title="Suskirstykite patikros veiksmus į atitinkamas kategorijas"
                instructions="Vilkite kiekvieną veiksmą į tinkamą kategoriją"
                categories={{
                  "Krautuvą bendrai": [
                    "Patikrinti krautuvo pažeidimus",
                    "Įvertinti aušinimo skystį",
                    "Patikrinti apšvietimą",
                  ],
                  "Važiuoklę specialiai": [
                    "Patikrinti padangas",
                    "Patikrinti stabdžius",
                    "Patikrinti pedalų neslidumą",
                    "Patikrinti vairo laisvumą",
                  ],
                  "Kėlimo įrenginius": [
                    "Patikrinti šakių peilius",
                    "Patikrinti grandines",
                    "Patikrinti hidraulinės sistemos skystį",
                  ],
                  "Papildomus įrenginius": [
                    "Patikrinti apsauginį stogelį",
                    "Patikrinti krovinių tinklelį",
                    "Patikrinti išmetamųjų dujų filtrus",
                  ],
                }}
              />
            </div>

            <div className="mb-6 h-px bg-gray-200"></div>

            {/* Third section with additional content */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Įsidemėtinos taisyklės !
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700"></p>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Krovinių paėmimui
                  </h3>
                  <p className="text-gray-700">
                    Neviršyti keliamosios galios. Atkreipti dėmesį į krovinių
                    svorio centro diagramą. Krovinį visada dėti ant šakių
                    uţpakalinės dalies. Kėlimo stovą palenkti atgal. Šakinį
                    krautuvą pakrauti tik tiek, kad būtų gerai matomas
                    vaţiuojamasis kelias.
                  </p>
                </div>

                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Saugiam vairavimui
                  </h3>
                  <p className="text-gray-700">
                    Krovinį vežti žemiausioje padėtyje. Posūkiuose važiuoti iš
                    lėto ir didžiausiu spinduliu. Nuokalnėse ir įkalnėse krovinį
                    vežti saugant iš šonų. Niekada nesisukti ant kelio su
                    nuolydžiu. Važiuoti tik laisvu (neužstatytu) keliu.
                  </p>
                </div>

                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Krovinių padėjimas
                  </h3>
                  <p className="text-gray-700">
                    Krovinį iš stovėjimo vietos pakelti arba nuleisti tik prieš
                    padedant. Kėlimo stovą į priekį palenkti tik virš padėjimo
                    plokštumos (rietuvės). Nepalikti šakinio krautuvo su pakeltu
                    kroviniu. Neužstatyti elektros skydinių, judėjimo kelių,
                    avarinių išėjimų, gelbėjimo kelių ir gesintuvų.
                  </p>
                </div>

                <div className="rounded-md border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Tikrinimas, specialus naudojimas ir pastatymas
                  </h3>
                  <p className="text-gray-700">
                    Patikrinti šakinio krautuvo veikimą ir ar nėra akivaizdžių
                    trūkumų. Nevežti asmenų, nebent būtų gamintojo įrengta
                    keleivio sėdynė. Nekelti asmenų aukštyn ar žemyn kėlimo
                    priemonėmis nebent būtų įrengta saugi platforma. Paliekant
                    šakinį krautuvą, nuleisti šakes, užtraukti rankinį stabdį,
                    ištraukti uždegimo/įjungimo raktelį.
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
                title="Praktinė užduotis: Saugus šakinio krautuvo naudojimas"
                description="Perskaitę saugaus darbo su krautuvu taisykles, pažymėkite teisingus teiginius:"
                options={[
                  {
                    id: "check1",
                    text: "Krovinį reikėtų vežti kuo aukščiau, kad būtų geresnis matomumas.",
                  },
                  {
                    id: "check2",
                    text: "Negalima važiuoti keliu su nuolydžiu apsisukant.",
                  },
                  {
                    id: "check3",
                    text: "Asmenis galima kelti kėlimo priemonėmis tik su specialiai įrengta platforma.",
                  },
                  {
                    id: "check4",
                    text: "Kraunant krovinį, jį reikėtų dėti kuo arčiau šakių priekio.",
                  },
                ]}
                correctAnswers={{
                  check1: false,
                  check2: true,
                  check3: true,
                  check4: false,
                }}
                explanations={{
                  check1:
                    "NETEISINGA. Krovinį reikia vežti žemiausioje padėtyje, kad būtų išlaikyta pusiausvyra ir saugumas.",
                  check2:
                    "TEISINGA. Draudžiama apsisukinėti ant kelio su nuolydžiu – tai pavojinga.",
                  check3:
                    "TEISINGA. Žmones kelti galima tik su gamintojo patvirtinta saugia platforma.",
                  check4:
                    "NETEISINGA. Krovinį reikia dėti ant šakių galinės (vidinės) dalies, kad būtų užtikrintas stabilumas.",
                }}
              />
            </div>
            {/* Second section with different content types */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Krovinių transportavimas
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700"></p>
              <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                <li>
                  <strong>Laikykitės nustatytų judėjimo kelių</strong>
                </li>
                <p>
                  - Šakiniu krautuvu galima važiuoti tik darbdavio nustatytais
                  keliais, skirtais būtent krautuvų eismui. Judėjimui reguliuoti
                  naudojami tiek kelių eismo ženklai, tiek įmonės vidaus
                  ženklinimas. Svarbu atsižvelgti į kelio keliamąją galią,
                  pravažiavimo aukštį ir plotį. Kelias turi būti pakankamai
                  platus – mažiausiai 0,5 m atstumas nuo krautuvo ar krovinio
                  iki kelio krašto, o pėsčiųjų zonose – 0,75 m.
                </p>
                <p>
                  - Pervežant itin plačius krovinius būtina gauti leidimą,
                  paskirti reguliuotoją ir važiuoti lėtai, žingsnio tempu.
                  Pravažiavimo aukštį gali riboti vamzdynai, ventiliacija ar
                  pakeliami vartai, o grindų pagrindas turi atlaikyti krautuvo
                  svorį.
                </p>
                <li>
                  <strong>Neužkraukite judėjimo kelių</strong>
                </li>
                <p>
                  - Judėjimo keliai negali būti užstatyti transporto
                  priemonėmis, tuščiais padėklais arba užtverti pačiu šakiniu
                  krautuvu. Šakinio krautuvo vairuotojas turi atkreipti dėmesį į
                  tai, kad jis pats ir kiti saugiai naudotų judėjimo kelius.
                </p>
                <li>
                  <strong>Krovinių paėmimas. Svorio centras</strong>
                </li>
                <p>
                  - Teorinio mokymo metu krautuvų vairuotojai mokomi apie
                  šakinio krautuvo stabilumą, kur svarbų vaidmenį atlieka
                  krovinio ir krautuvo svorio centrai. Svorio centras – tai
                  taškas, kuriame susitelkia kūno masė. Paprastai jis yra
                  krovinio viduryje, tačiau netaisyklingos formos objektams jį
                  nustatyti sunkiau. Tokiais atvejais būtini prižiūrinčiojo
                  nurodymai. Siekiant saugumo, ant krovinio turėtų būti pažymėta
                  jo svorio centro padėtis.
                </p>
                <li>
                  <strong>Krovinio padėtis ir svorio centras</strong>
                </li>
                <p>
                  - Šakinio krautuvo stabilumas priklauso nuo svorio centrų
                  padėties. Krautuvo svorio centras paprastai yra po vairuotojo
                  sėdyne – kuo jis toliau nuo priekinės ašies, tuo stabilesnis
                  krautuvas
                </p>
                <p>
                  - Pusiausvyra vertinama kaip svirties principas: priekinių
                  ratų ašis yra tarsi svirties atrama. Vienoje pusėje veikia
                  krautuvo svoris, kitoje – krovinys. Kad krautuvas neapvirstų,
                  krovinio svorio centras turi būti kuo arčiau šakių galo, taip
                  sumažinant petį.
                </p>
                <li>
                  <strong>Krovinio nuėmimas.</strong>
                </li>
                <p>
                  - Kai daiktai vežami automobiliu ir dėžėse, prieš pakrovimą
                  įsitikinti, kad krovinio svoris yra saugus. Ar krautuvas yra
                  pakankamos keliamosios galios. Kur yra krovinio svorio
                  centras. Ar galima taisyklingai paiimt krovinį.
                </p>
                <p>
                  - Svorį galima rasti pervežimo dokumentuose. Šakinio krautuvo
                  keliamoji galia nurodyta gamyklinėje etiketėje. Tik tada, kai
                  teisingai nustatyta svorio centro padėtis, šakinio krautuvo
                  vairuotojas gali nukreipti šakių peilius į teisingą poziciją.
                </p>
                <li>
                  <strong>Krautuvo stabilumas</strong>
                </li>
                <p>
                  - Pavojingiausias šakinio krautuvo avarijos atvejis – virtimas
                  į šoną. Vairuotojai dažnai instinktyviai bando nušokti į
                  virtimo pusę, tačiau tai pavojinga – juos gali prispausti
                  krautuvas. Saugiausia – tvirtai laikytis už vairo ir
                  neatsitraukti nuo sėdynės.
                </p>
                <p>
                  - Krautuvo stabilumas grindžiamas „virtimo trikampiu“, kurio
                  viršūnė yra valdomos ašies taške. Tuščio ir pakrauto krautuvo
                  svorio centras yra trikampio viduje. Pakrautas krautuvas yra
                  stabilesnis, nes jo svorio centras turi didesnį saugos momentą
                  (sunkesnis krovinys ir didesnis svirimo petys).
                </p>
                <p>
                  - Pakrautas krautuvas rečiau virsta posūkiuose nei tuščias.
                  Vairuotojas turi žinoti virtimo priežastis ir mokytis jų
                  vengti.
                </p>
              </ul>
            </div>

            <div className="mb-6 h-px bg-gray-200"></div>

            {/* Fourth section: Emergency procedures */}
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Avarines situacijos ir veiksmai
            </h2>

            <div className="mb-8">
              <p className="mb-4 text-gray-700">
                Šakinio krautuvos operatorius turi žinoti, kaip elgtis avarinių
                situacijų atveju ir kaip jų galima išvengti
              </p>

              <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
                <h3 className="mb-2 font-semibold">
                  SVARBU: Avarinės situacijos išvengimas
                </h3>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    Neperkrauti šakinio krautuvo. Didžiausią leistiną apkrovą
                    galima rasti gamyklinėje etiketėje arba krovinio svorio
                    centro diagramoje{" "}
                  </li>
                  <li>
                    Niekada negalima bandyti padidinti šakinio krautuvo
                    keliamąją galią panaudojant papildomas atsvaras
                  </li>
                  <li>
                    Krovinį paskirstyti tolygiai ant abiejų šakių peilių ir
                    apsaugoti nuo pasislinkimo arba nukritimo
                  </li>
                  <li>
                    Prieš važiavimą kėlimo stovą palenkti atgal. Tada krovinys
                    stabdant bus saugus
                  </li>
                </ul>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border-l-4 border-l-yellow-500 bg-yellow-50 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Svarbiausi vairuotojo principai
                  </h3>

                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    <li>Prieš važiuojant šakes nuleisti kuo žemiau</li>
                    <li>Kėlimo stovą palenkti atgal</li>
                    <li>
                      Su pakeltu kroviniu važiuoti tik kraunant ar nuimant
                    </li>
                    <li>Įkalnėse ir nuokalnėse važiuoti labai atsargiai</li>
                  </ul>
                </div>

                <div className="rounded-md border-l-4 border-l-blue-500 bg-blue-50 p-4">
                  <h3 className="mb-2 font-medium text-gray-800">
                    Matomumas padeda išvengti avarinių situacijų
                  </h3>

                  <ol className="list-inside list-disc space-y-1 text-gray-700">
                    <li>
                      Važiuojant šakiniu krautuvu, vairuotojas visomis kryptimis
                      turi aiškiai matyti kelią.
                    </li>
                    <li>
                      Krovinys turi būti pakeltas tiek, kad netrukdytų
                      matomumui.
                    </li>
                    <li>
                      Jei krovinys užstoja vaizdą, reikia važiuoti atbulomis
                      arba naudoti reguliuotoją.
                    </li>
                    <li>
                      Nuolatinis važiavimas su matomumą ribojančiais kroviniais
                      pažeidžia saugos taisykles – tokiais atvejais būtina
                      naudoti kitą tinkamą transporto priemonę
                    </li>
                  </ol>
                </div>
              </div>

              {/* Interactive scenario */}
              <SingleChoiceQuiz quizData={validQuizData} />
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

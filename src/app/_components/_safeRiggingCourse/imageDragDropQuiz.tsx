import { useState, useEffect } from "react";

// Define types for our component props and state
interface ImageItem {
  id: string;
  src: string;
  alt: string;
  correctZoneId: string;
}

interface DropZone {
  id: string;
  label: string;
  description: string;
}

interface QuizResults {
  correct: number;
  total: number;
  isAllCorrect: boolean;
}

type PlacedImagesMap = Record<string, string>;

interface ImageDragDropQuizProps {
  title?: string;
  imageItems?: ImageItem[];
  dropZones?: DropZone[];
  instructionsText?: string;
  imagesLabel?: string;
  zonesLabel?: string;
}

export default function ImageDragDropQuiz({
  title = "Praktinė užduotis",
  imageItems = [
    {
      id: "img1",
      src: "/images/aukstyn.png",
      alt: "",
      correctZoneId: "zone1",
    },
    {
      id: "img2",
      src: "/images/isskleisti-strele.png",
      alt: "",
      correctZoneId: "zone2",
    },
    {
      id: "img3",
      src: "/images/avarinis-stabdymas.png",
      alt: "",
      correctZoneId: "zone3",
    },
    {
      id: "img4",
      src: "/images/strele-zemyn.png",
      alt: "",
      correctZoneId: "zone4",
    },
  ],
  dropZones = [
    {
      id: "zone1",
      label: "Signalas rodantis kelti krovinį aukštyn",
      description: "",
    },
    {
      id: "zone2",
      label: "Signalas rodantis išskleisti strėlę",
      description: "",
    },
    {
      id: "zone3",
      label: "Signalas reiškiantis avarinį stabdymą",
      description: "",
    },
    {
      id: "zone4",
      label: "Signalas rodantis nuleisti strelę",
      description: "",
    },
  ],
  instructionsText = "Nutempk nuotraukas į teisingą vietą",
  imagesLabel = "",
  zonesLabel = "",
}: ImageDragDropQuizProps) {
  const [placedImages, setPlacedImages] = useState<PlacedImagesMap>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [shuffledImages, setShuffledImages] = useState<ImageItem[]>([]);

  // Shuffle images ONLY on initial load
  useEffect(() => {
    // Create a stable shuffle that doesn't change on re-renders
    const shuffled = [...imageItems].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
    // We intentionally omit imageItems from the dependency array to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragStart = (imageId: string): void => {
    setDraggedItem(imageId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (zoneId: string): void => {
    if (!draggedItem) return;

    // Update the placed images
    const newPlacedImages = { ...placedImages };

    // If there's already an image in this zone, remove it
    Object.keys(newPlacedImages).forEach((key) => {
      if (newPlacedImages[key] === zoneId) {
        delete newPlacedImages[key];
      }
    });

    // Place the new image
    newPlacedImages[draggedItem] = zoneId;
    setPlacedImages(newPlacedImages);
    setDraggedItem(null);

    // Check if all images are placed
    if (Object.keys(newPlacedImages).length === imageItems.length) {
      checkAnswers(newPlacedImages);
    }
  };

  const handleRemoveImage = (imageId: string): void => {
    const newPlacedImages = { ...placedImages };
    delete newPlacedImages[imageId];
    setPlacedImages(newPlacedImages);
    setResults(null);
  };

  const checkAnswers = (placements: PlacedImagesMap): void => {
    const correctPlacements = imageItems.filter(
      (item) => placements[item.id] === item.correctZoneId,
    ).length;

    setResults({
      correct: correctPlacements,
      total: imageItems.length,
      isAllCorrect: correctPlacements === imageItems.length,
    });
  };

  const resetExercise = (): void => {
    setPlacedImages({});
    setResults(null);

    // Create a new shuffle only when explicitly requested
    const shuffled = [...imageItems].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
  };

  // Find which image is in a zone
  const getImageInZone = (zoneId: string): ImageItem | undefined => {
    const imageId = Object.keys(placedImages).find(
      (key) => placedImages[key] === zoneId,
    );
    return imageItems.find((item) => item.id === imageId);
  };

  // Check if an image is already placed
  const isImagePlaced = (imageId: string): boolean => {
    return Object.keys(placedImages).includes(imageId);
  };

  // If shuffledImages is empty (shouldn't happen but just in case), use imageItems
  const displayImages = shuffledImages.length > 0 ? shuffledImages : imageItems;

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="mb-4 text-xl font-medium text-gray-800">{title}</h3>

      <p className="mb-4 text-gray-600">{instructionsText}</p>

      <div className="flex flex-col space-y-8">
        {/* Images to drag */}
        <div>
          <h4 className="mb-2 text-lg font-medium text-gray-700">
            {imagesLabel}
          </h4>
          <div className="flex flex-wrap gap-4">
            {displayImages.map((item) => (
              <div
                key={item.id}
                className={`relative ${isImagePlaced(item.id) ? "opacity-40" : "cursor-grab"}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  draggable={!isImagePlaced(item.id)}
                  onDragStart={() =>
                    !isImagePlaced(item.id) && handleDragStart(item.id)
                  }
                  className={`h-24 w-24 rounded-md border-2 ${
                    isImagePlaced(item.id)
                      ? "border-gray-200"
                      : "border-stone-300 hover:border-stone-500"
                  } object-cover transition-all`}
                />
                <div className="mt-1 text-center text-sm text-gray-600">
                  {item.alt}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drop zones */}
        <div>
          <h4 className="mb-2 text-lg font-medium text-gray-700">
            {zonesLabel}
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dropZones.map((zone) => {
              const imageInZone = getImageInZone(zone.id);
              return (
                <div
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(zone.id)}
                  className={`flex flex-col rounded-lg border-2 ${
                    imageInZone
                      ? "border-stone-400"
                      : "border-dashed border-gray-300"
                  } p-4 transition-colors`}
                >
                  <div className="mb-2 font-medium">{zone.label}</div>
                  <p className="text-sm text-gray-600">{zone.description}</p>

                  <div
                    className={`mt-4 flex h-28 min-h-28 items-center justify-center rounded-md ${
                      imageInZone ? "bg-stone-50" : "bg-gray-50"
                    }`}
                  >
                    {imageInZone ? (
                      <div className="relative">
                        <img
                          src={imageInZone.src}
                          alt={imageInZone.alt}
                          className="h-24 w-24 rounded-md object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(imageInZone.id)}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Įtempkite nuotrauką čia
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div
            className={`mt-4 rounded-md p-4 ${
              results.isAllCorrect ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <p className="font-medium">
              {results.isAllCorrect
                ? "Teisingai !"
                : `${results.correct} iš ${results.total} teisingai. Bandyk vėl !`}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={resetExercise}
            className="rounded-md bg-stone-600 px-4 py-2 text-white hover:bg-stone-700"
          >
            Pradėti iš naujo
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

type DragDropQuizProps = {
  title?: string;
  actions?: string[];
  correctOrderIndexes?: number[];
  instructionsText?: string;
  actionsLabel?: string;
  orderLabel?: string;
};

export default function DragDropQuiz({
  title = "Sudėliokite kėlimo įrangos patikrinimo veiksmus tinkama tvarka",
  actions = [
    "Atlikti vizualinį patikrinimą",
    "Patikrinti apkrovos žymėjimus",
    "Užpildyti patikros dokumentus",
    "Pranešti apie problemas vadovui",
  ],
  correctOrderIndexes = [0, 1, 3, 2],
  instructionsText = "Vilkite veiksmus čia",
  actionsLabel = "Veiksmai:",
  orderLabel = "Teisinga tvarka:",
}: DragDropQuizProps) {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<"actions" | "completed" | null>(
    null,
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleDragStart = (item: string, source: "actions" | "completed") => {
    setDraggedItem(item);
    setDragSource(source);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropInSequence = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItem || dragSource !== "actions") return;

    // Prevent duplicate items
    if (!completedItems.includes(draggedItem)) {
      const updatedItems = [...completedItems, draggedItem];
      setCompletedItems(updatedItems);

      // Check correctness if complete
      if (correctOrderIndexes && updatedItems.length === actions.length) {
        const userIndexes = updatedItems.map((item) => actions.indexOf(item));
        const isCorrectOrder =
          JSON.stringify(userIndexes) === JSON.stringify(correctOrderIndexes);
        setIsCorrect(isCorrectOrder);
      }
    }

    setDraggedItem(null);
    setDragSource(null);
  };

  const handleDropInActions = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItem || dragSource !== "completed") return;

    setCompletedItems((prev) => prev.filter((item) => item !== draggedItem));
    setIsCorrect(null); // Reset correctness check
    setDraggedItem(null);
    setDragSource(null);
  };

  const resetExercise = () => {
    setCompletedItems([]);
    setIsCorrect(null);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="mb-4 text-xl font-medium text-gray-800">{title}</h3>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
        {/* Available actions */}
        <div
          className="flex-1"
          onDrop={handleDropInActions}
          onDragOver={handleDragOver}
        >
          <h4 className="mb-2 text-lg font-medium text-gray-700">
            {actionsLabel}
          </h4>
          <div className="space-y-2">
            {actions.map((item) => {
              const isUsed = completedItems.includes(item);
              return (
                <div
                  key={item}
                  draggable={!isUsed}
                  onDragStart={() => handleDragStart(item, "actions")}
                  className={`rounded-md p-3 transition-colors ${
                    isUsed
                      ? "bg-gray-100 text-gray-400"
                      : "cursor-grab border border-stone-300 bg-white hover:bg-stone-50"
                  }`}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drop zone */}
        <div className="flex-1">
          <h4 className="mb-2 text-lg font-medium text-gray-700">
            {orderLabel}
          </h4>
          <div
            onDrop={handleDropInSequence}
            onDragOver={handleDragOver}
            className="min-h-40 rounded-md border-2 border-dashed border-stone-300 bg-stone-50 p-4"
          >
            {completedItems.length > 0 ? (
              <div className="space-y-2">
                {completedItems.map((item, index) => (
                  <div
                    key={item}
                    draggable
                    onDragStart={() => handleDragStart(item, "completed")}
                    className="cursor-grab rounded-md bg-stone-200 p-3 hover:bg-stone-300"
                  >
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">{instructionsText}</p>
            )}
          </div>

          {completedItems.length === actions.length && (
            <div className="mt-4">
              {isCorrect !== null && (
                <div
                  className={`rounded-md p-3 ${
                    isCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isCorrect
                    ? "Teisingai!"
                    : "Neteisingai. Bandykite dar kartą."}
                </div>
              )}
              <button
                onClick={resetExercise}
                className="mt-2 rounded-md bg-stone-600 px-4 py-2 text-white hover:bg-stone-700"
              >
                Pradėti iš naujo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

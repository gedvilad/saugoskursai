import { useState } from "react";

type CategorizeQuizProps = {
  title?: string;
  instructions?: string;
  categories: Record<string, string[]>;
};

export default function CategorizeQuiz({
  title = "Suskirstykite veiksmus į kategorijas",
  instructions = "Vilkite kiekvieną veiksmą į tinkamą kategoriją",
  categories,
}: CategorizeQuizProps) {
  const [assigned, setAssigned] = useState<Record<string, string[]>>(() =>
    Object.keys(categories).reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}),
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [sourceCategory, setSourceCategory] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);

  const allItems = Object.values(categories).flat();
  const unassigned = allItems.filter(
    (item) => !Object.values(assigned).flat().includes(item),
  );

  const handleDragStart = (item: string, from?: string) => {
    setDraggedItem(item);
    setSourceCategory(from ?? null);
  };

  const handleDrop = (category: string) => {
    if (!draggedItem) return;
    // Remove from previous
    if (sourceCategory) {
      setAssigned((prev) => ({
        ...prev,
        [sourceCategory]: (prev[sourceCategory] ?? []).filter(
          (i) => i !== draggedItem,
        ),
      }));
    }

    // Add to new
    setAssigned((prev) => ({
      ...prev,
      [category]: [...(prev[category] ?? []), draggedItem],
    }));

    setDraggedItem(null);
    setSourceCategory(null);
    setChecked(null);
  };

  const checkAnswers = () => {
    const isCorrect = Object.entries(categories).every(
      ([cat, correctItems]) => {
        const assignedItems = assigned[cat] ?? [];
        return (
          assignedItems.length === correctItems.length &&
          assignedItems.every((item) => correctItems.includes(item))
        );
      },
    );
    setChecked(isCorrect);
  };

  const reset = () => {
    setAssigned(
      Object.keys(categories).reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}),
    );
    setChecked(null);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="mb-4 text-xl font-semibold text-gray-800">{title}</h3>
      <p className="mb-4 text-gray-600">{instructions}</p>

      {/* Unassigned Items */}
      <div className="mb-6">
        <h4 className="mb-2 font-medium text-gray-700">Veiksmai:</h4>
        <div className="flex flex-wrap gap-2">
          {unassigned.map((item) => (
            <div
              key={item}
              draggable
              onDragStart={() => handleDragStart(item)}
              className="cursor-grab rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm hover:bg-gray-50"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zones */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.keys(categories).map((category) => (
          <div
            key={category}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(category)}
            className="min-h-[100px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4"
          >
            <h5 className="mb-2 font-semibold text-gray-700">{category}</h5>
            <div className="space-y-1">
              {assigned[category]?.map((item) => (
                <div
                  key={item}
                  draggable
                  onDragStart={() => handleDragStart(item, category)}
                  className="cursor-grab rounded bg-gray-200 px-3 py-2 hover:bg-gray-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6">
        {checked !== null && (
          <div
            className={`mb-2 rounded-md p-3 ${
              checked
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {checked
              ? "Teisingai suskirstyta!"
              : "Kai kurie veiksmai priskirti neteisingai."}
          </div>
        )}
        <button
          onClick={checkAnswers}
          className="mr-3 rounded bg-stone-600 px-4 py-2 text-white hover:bg-stone-700"
        >
          Tikrinti
        </button>
        <button
          onClick={reset}
          className="rounded border border-gray-400 px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Iš naujo
        </button>
      </div>
    </div>
  );
}

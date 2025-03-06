// app/teorija/layout.tsx

export default function TeorijaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <div className="fixed left-0 top-[45px] z-40 mb-4 flex w-full gap-4 bg-white p-4 shadow-md">
        {["section1", "section2", "section3"].map((section) => (
          <a
            key={section}
            href={`#${section}`}
            className="rounded bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
          >
            {section.toUpperCase()}
          </a>
        ))}
      </div>
      <main>{children}</main>
    </div>
  );
}

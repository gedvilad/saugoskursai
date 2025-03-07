import React, { useEffect, useState } from "react";

interface MessageProps {
  type: "success" | "error";
  message: string;
}

const Message: React.FC<MessageProps> = ({ type, message }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`absolute left-1/2 mb-4 flex items-center rounded-lg border p-4 text-sm ${
        type === "error"
          ? "border-red-300 bg-red-50 text-red-800"
          : "border-green-300 bg-green-50 text-green-800"
      }`}
      role="alert"
    >
      <svg
        className="me-3 inline h-4 w-4 shrink-0"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
      </svg>
      <span className="sr-only">Info</span>
      <div>
        <span className="font-medium">
          {type === "error" ? "Klaida!" : "Sėkmė!"}
        </span>{" "}
        {message}
      </div>
    </div>
  );
};

export default Message;

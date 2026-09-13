import { useEffect, useRef } from "react";

export function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}>
      <div
        ref={contentRef}
        style={{
          background: "white",
          margin: "10% auto",
          padding: 20,
          width: 400,
        }}
      >
        {children}
      </div>
    </div>
  );
}

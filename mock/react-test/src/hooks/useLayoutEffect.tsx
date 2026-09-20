// useLayoutEffect runs synchronously after DOM updates and before the browser paints.
// It is useful for measuring layout or applying DOM changes that must happen before the user sees the frame.
// It can block painting, so prefer useEffect unless avoiding visible flicker requires it.
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

type TooltipProps = {
  children: ReactNode;
  content: string;
};

type Position = {
  left: number;
  top: number;
};

export function Tooltip({ children, content }: TooltipProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) {
      return;
    }

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let left = trigger.left + trigger.width / 2 - tooltip.width / 2;
    let top = trigger.top - tooltip.height - gap;

    // Keep the tooltip inside the horizontal viewport.
    left = Math.max(
      gap,
      Math.min(left, window.innerWidth - tooltip.width - gap),
    );

    // Show below the trigger if there is not enough room above it.
    if (top < gap) {
      top = trigger.bottom + gap;
    }

    setPosition({ left, top });
  }, [isOpen, content]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {children}
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: "fixed",
            left: position?.left ?? 0,
            top: position?.top ?? 0,
            visibility: position ? "visible" : "hidden",
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

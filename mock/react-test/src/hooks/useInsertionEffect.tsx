// useInsertionEffect runs before layout effects so styles can be inserted before layout reads.
// It exists mainly for CSS-in-JS libraries that inject rules during rendering.
// Application code should rarely use it, and it should not be used for normal effects or state updates.
import { useInsertionEffect, useLayoutEffect, useRef, useState } from "react";

const insertedRules = new Map<string, HTMLStyleElement>();

function useCssRule(id: string, cssText: string) {
  useInsertionEffect(() => {
    if (insertedRules.has(id)) {
      return;
    }

    const style = document.createElement("style");
    style.dataset.ruleId = id;
    style.textContent = cssText;
    document.head.appendChild(style);
    insertedRules.set(id, style);

    return () => {
      insertedRules.delete(id);
      style.remove();
    };
  }, [cssText, id]);
}

export function AutoMeasuredBadge() {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);

  useCssRule(
    "auto-measured-badge",
    `
      .auto-measured-badge {
        display: inline-block;
        box-sizing: border-box;
        min-width: 96px;
        padding: 8px 12px;
        border: 1px solid #0f766e;
        border-radius: 4px;
        color: #0f766e;
        font: 600 14px/1.2 system-ui, sans-serif;
      }
    `,
  );

  useLayoutEffect(() => {
    const nextWidth = badgeRef.current?.getBoundingClientRect().width ?? 0;
    setWidth(nextWidth);
  }, []);

  return (
    <div>
      <span className="auto-measured-badge" ref={badgeRef}>
        Paid
      </span>
      <p>Measured width: {Math.round(width)}px</p>
    </div>
  );
}

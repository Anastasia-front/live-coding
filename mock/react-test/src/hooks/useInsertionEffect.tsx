// useInsertionEffect runs before layout effects so styles can be inserted before layout reads.
// It exists mainly for CSS-in-JS libraries that inject rules during rendering.
// Application code should rarely use it, and it should not be used for normal effects or state updates.
import { useInsertionEffect } from "react";

export function InsertedStyles() {
  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.textContent = ".inserted-style-example { color: tomato; }";
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return <div className="inserted-style-example">Styled before layout</div>;
}

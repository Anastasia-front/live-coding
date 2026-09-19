// useImperativeHandle customizes the value exposed to a parent through a ref.
// It is useful for focused imperative actions like focus, scroll, or reset on reusable components.
// Prefer declarative props for normal data flow; keep the exposed handle small and stable.
import {
  forwardRef,
  type InputHTMLAttributes,
  useImperativeHandle,
  useRef,
} from "react";

export type FocusInputHandle = {
  focus: () => void;
};

export const FocusInput = forwardRef<
  FocusInputHandle,
  InputHTMLAttributes<HTMLInputElement>
>(function FocusInput(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  return <input ref={inputRef} {...props} />;
});

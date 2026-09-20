// useImperativeHandle customizes the value exposed to a parent through a ref.
// It is useful for focused imperative actions like focus, scroll, or reset on reusable components.
// Prefer declarative props for normal data flow; keep the exposed handle small and stable.
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
  type SubmitEvent,
} from "react";

export type TextFieldHandle = {
  focus: () => void;
  select: () => void;
};

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
};

export const TextField = forwardRef<TextFieldHandle, TextFieldProps>(
  function TextField({ error, id, label, ...inputProps }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = id ?? inputProps.name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      select: () => inputRef.current?.select(),
    }));

    return (
      <div>
        <label htmlFor={inputId}>{label}</label>
        <input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          id={inputId}
          ref={inputRef}
          {...inputProps}
        />
        {error && (
          <p id={errorId} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

export function CheckoutEmailExample() {
  const emailRef = useRef<TextFieldHandle>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      emailRef.current?.focus();
      emailRef.current?.select();
      return;
    }

    setError(undefined);
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        error={error}
        label="Email"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        ref={emailRef}
        type="email"
        value={email}
      />
      <button type="submit">Continue</button>
    </form>
  );
}

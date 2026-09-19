// useActionState manages state produced by a form action.
// It is useful when a submit action needs to return validation errors, success messages, or updated form state.
// The action function should return the next state, and pending UI should come from the hook instead of separate manual flags.
import { useActionState } from "react";

type FormState = {
  error: string | null;
  message: string | null;
};

async function submitName(
  previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = formData.get("name");

  if (typeof name !== "string" || name.trim() === "") {
    return {
      error: "Name is required.",
      message: previousState.message,
    };
  }

  return {
    error: null,
    message: `Saved ${name.trim()}.`,
  };
}

export function NameForm() {
  const [state, formAction, isPending] = useActionState(submitName, {
    error: null,
    message: null,
  });

  return (
    <form action={formAction}>
      <label>
        Name
        <input name="name" />
      </label>
      <button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save"}
      </button>
      {state.error && <p>{state.error}</p>}
      {state.message && <p>{state.message}</p>}
    </form>
  );
}

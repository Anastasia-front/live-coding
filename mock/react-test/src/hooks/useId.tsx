// useId creates a stable unique id for accessibility attributes.
// It is mainly used to connect labels, inputs, descriptions, and error messages in reusable components.
// It is not for list keys or random ids, and the generated value should not be changed manually.
import { useId } from "react";

export function NameField() {
  const id = useId();

  return (
    <label htmlFor={id}>
      Name
      <input id={id} />
    </label>
  );
}

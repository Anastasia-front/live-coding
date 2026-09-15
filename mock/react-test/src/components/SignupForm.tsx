import { SyntheticEvent, useState } from "react";

type Errors = { email?: string; password?: string };

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): Errors {
    const newErrors: Errors = {};
    if (!email.includes("@")) newErrors.email = "Enter a valid email";
    if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    return newErrors;
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // fake request
    setSubmitting(false);
    setSuccess(true);
    setEmail("");
    setPassword("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Sign Up"}
      </button>
      {success && <p style={{ color: "green" }}>Signed up successfully!</p>}
    </form>
  );
}

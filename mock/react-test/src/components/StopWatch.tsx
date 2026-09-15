import { useEffect, useState } from "react";

export function StopWatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  function handleReset() {
    setSeconds(0);
    setRunning(false);
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      (prevState: number) => setSeconds(prevState + 1),
      1000,
    );

    return () => clearInterval(id);
  }, [running]);

  return (
    <div>
      <p>{seconds}</p>
      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Pause</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

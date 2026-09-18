// useSyncExternalStore subscribes React to state owned outside React.
// It is useful for browser APIs, event emitters, and state libraries that need concurrent-safe reads.
// The snapshot must be stable between changes, and subscribe must return a cleanup function.
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot() {
  return window.innerWidth;
}

export function WindowWidth() {
  const width = useSyncExternalStore(subscribe, getSnapshot);

  return <div>Width: {width}</div>;
}

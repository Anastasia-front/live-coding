// useLayoutEffect runs synchronously after DOM updates and before the browser paints.
// It is useful for measuring layout or applying DOM changes that must happen before the user sees the frame.
// It can block painting, so prefer useEffect unless avoiding visible flicker requires it.
import { useLayoutEffect, useRef, useState } from "react";

export function MeasuredBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const nextHeight = ref.current?.getBoundingClientRect().height ?? 0;
    setHeight(nextHeight);
  }, []);

  return <div ref={ref}>Height: {height}</div>;
}

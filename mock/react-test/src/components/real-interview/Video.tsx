import { forwardRef, useEffect, useState } from "react";

type SubtitleType = {
  url: string;
  lang: string;
};

type Props = {
  poster?: string;
  streamUrl?: string;
  subtitles?: SubtitleType[];
};

type SubtitleTrack = {
  lang: string;
  src: string;
};

type SrtCue = {
  index: number;
  startMs: number;
  endMs: number;
  text: string[];
};

const TIMING_LINE =
  /^(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;

function toMs(
  hours: string,
  minutes: string,
  seconds: string,
  milliseconds: string,
): number {
  return (
    Number(hours) * 60 * 60 * 1000 +
    Number(minutes) * 60 * 1000 +
    Number(seconds) * 1000 +
    Number(milliseconds)
  );
}

export function parseSrt(raw: string): (SrtCue | null)[] {
  return raw
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      const timing = lines[1]?.match(TIMING_LINE);
      if (!timing || !/^\d+$/.test(lines[0])) return null;
      return {
        index: Number(lines[0]),
        startMs: toMs(timing[1], timing[2], timing[3], timing[4]),
        endMs: toMs(timing[5], timing[6], timing[7], timing[8]),
        text: lines.slice(2),
      };
    });
}

function toVttTime(ms: number) {
  const hours = Math.floor(ms / 3_600_000);

  const minutes = Math.floor((ms % 3_600_000) / 60_000);

  const seconds = Math.floor((ms % 60_000) / 1000);

  const millis = ms % 1000;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")
    .concat(".", String(millis).padStart(3, "0"));
}

function srtToVtt(raw: string) {
  const cues = parseSrt(raw).filter(
    (cue): cue is NonNullable<ReturnType<typeof parseSrt>[number]> =>
      cue !== null,
  );

  return [
    "WEBVTT",
    "",
    ...cues.flatMap((cue) => [
      String(cue.index),
      `${toVttTime(cue.startMs)} --> ${toVttTime(cue.endMs)}`,
      cue.text.join("\n"),
      "",
    ]),
  ].join("\n");
}

export const VideoSurface = forwardRef<HTMLVideoElement, Props>(
  function VideoSurface({ poster, streamUrl, subtitles = [] }, ref) {
    const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);

    useEffect(() => {
      const controller = new AbortController();

      const objectUrls: string[] = [];

      async function loadSubtitles() {
        try {
          const tracks = await Promise.all(
            subtitles.map(async (subtitle) => {
              const response = await fetch(subtitle.url, {
                signal: controller.signal,
              });

              if (!response.ok) {
                throw new Error(`Failed to load subtitles: ${response.status}`);
              }

              const raw = await response.text();

              const vtt = srtToVtt(raw);

              const blob = new Blob([vtt], {
                type: "text/vtt",
              });

              const src = URL.createObjectURL(blob);

              objectUrls.push(src);

              return {
                lang: subtitle.lang,
                src,
              };
            }),
          );

          if (!controller.signal.aborted) {
            setSubtitleTracks(tracks);
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          console.error("Failed to load subtitles", error);

          setSubtitleTracks([]);
        }
      }

      loadSubtitles();

      return () => {
        controller.abort();

        objectUrls.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [subtitles]);

    return (
      <video
        ref={ref}
        poster={poster}
        data-stream-url={streamUrl}
        muted
        controls
        playsInline
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          background: "#000",
          borderRadius: 8,
          display: "block",
        }}
      >
        {subtitleTracks.map((track) => (
          <track
            key={track.lang}
            kind="subtitles"
            src={track.src}
            srcLang={track.lang}
            label={track.lang === "en" ? "English" : track.lang}
            default={track.lang === "en"}
          />
        ))}
      </video>
    );
  },
);

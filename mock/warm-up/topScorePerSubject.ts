export type ScoreEntry = { student: string; subject: string; score: number };
export type ScoreReturn = Record<string, ScoreEntry[]>;

export const topScorePerSubject = (
  scores: ScoreEntry[],
  n: number,
): ScoreReturn | [] => {
  if (n > 0) {
    const groupedBySubject = scores.reduce(
      (acc: ScoreReturn, student: ScoreEntry) => {
        const state = acc[student.subject];
        acc[student.subject] = state ? [...state, student] : [student];
        return acc;
      },
      {},
    );

    const result = Object.entries(groupedBySubject).map(([subject, items]) => [
      subject,
      [...items].sort((a, b) => b.score - a.score).slice(0, n),
    ]);

    return Object.fromEntries(result);
  }

  return [];
};

// Related example:
// const scores: ScoreEntry[] = [
//   { student: "Alice", subject: "math", score: 85 },
//   { student: "Bob", subject: "math", score: 92 },
//   { student: "Carol", subject: "math", score: 78 },
//   { student: "Alice", subject: "science", score: 90 },
//   { student: "Bob", subject: "science", score: 88 },
//   { student: "Dave", subject: "math", score: 95 },
// ];
//
// console.log(topScorePerSubject(scores, 2));
// Output:
// {
//   math: [
//     { student: "Dave", subject: "math", score: 95 },
//     { student: "Bob", subject: "math", score: 92 },
//   ],
//   science: [
//     { student: "Alice", subject: "science", score: 90 },
//     { student: "Bob", subject: "science", score: 88 },
//   ],
// }

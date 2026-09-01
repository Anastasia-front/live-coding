export function mostFrequent(arr: string[]): string {
  if (arr.length === 0) return "0";

  const result = arr.reduce((acc: { [key: string]: number }, item: string) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(result));
  return Object.keys(result).find((key) => result[key] === maxCount) || "0";
}

// Related example:
// console.log(
//   mostFrequent(["apple", "banana", "apple", "orange", "banana", "apple"]),
// );

export function groupBy(arr: any[], key: number | string) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

// Related example:
// console.log(
//   groupBy(
//     [
//       { name: "Alice", age: 25 },
//       { name: "Bob", age: 30 },
//       { name: "Charlie", age: 25 },
//     ],
//     "age",
//   ),
// );

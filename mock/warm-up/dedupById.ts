export const dedupById = (arr: any[]): any[] => {
  return [...new Map(arr.map((item) => [item.id, item] as const)).values()];
};

// Related example:
// console.log(
//   dedupById([
//     { id: 1, name: "Alice" },
//     { id: 2, name: "Bob" },
//     { id: 1, name: "Alan" },
//   ]),
// );
// Output: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]

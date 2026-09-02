export const flatten = (arr: any[]): any =>
  arr.reduce(
    (acc, item) => acc.concat(Array.isArray(item) ? flatten(item) : item),
    [],
  );

// Related example:
// console.log(flatten([1, [2, [3, 4], 5], 6]));
// Output: [1, 2, 3, 4, 5, 6]

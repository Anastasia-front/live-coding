// Q1a (warm-up): Write a loop that prints only the even numbers from an array, without using .filter().

const printEven = (arr: number[]): void => {
  for (let i = 0; i <= arr.length; i++) {
    if (i % 2 === 0) {
      console.log(i);
    }
  }
};
// printEven([0, 4, 3, 2, 5, 6, 7, 8]);

// Q1b (harder — the actual test): You have a 2D array (matrix). Write a function flattenMatrix(matrix) using nested loops (not .flat()) that returns a single flat array of all values, row by row.

// function flattenMatrix(matrix: number[][]): number[] {
//   return matrix.reduce((acc, item) => {
//     if (Array.isArray(item)) {
//       item.forEach((i) => acc.push(i));
//     } else {
//       acc.push(item);
//     }
//     return acc;
//   }, []);
// }

function flattenMatrix(matrix: number[][]): number[] {
  const result: number[] = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; i < matrix[i].length; j++) {
      result.push(matrix[i][j]);
    }
  }
  return result;
}

console.log(flattenMatrix([[1, 2, 3], [4, 5], [6]]));
// // → [1, 2, 3, 4, 5, 6]

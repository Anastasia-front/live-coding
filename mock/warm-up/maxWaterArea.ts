function maxWaterArea(heights: number[]): number {
  if (heights.length < 2) return 0;

  let leftPointer = 0;
  let rightPointer = heights.length - 1;
  let maxArea = 0;

  while (leftPointer < rightPointer) {
    const wallWidth = rightPointer - leftPointer;
    const wallHeight = Math.min(heights[leftPointer], heights[rightPointer]);
    maxArea = Math.max(maxArea, wallWidth * wallHeight);

    if (heights[leftPointer] < heights[rightPointer]) {
      leftPointer++;
    } else {
      rightPointer--;
    }
  }

  return maxArea;
}

console.log(maxWaterArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));
// Best pair: index 1 (height 8) and index 8 (height 7)
// Width = 8-1 = 7, height = min(8,7) = 7, area = 7*7 = 49
// Output: 49

console.log(maxWaterArea([1, 1]));
// Only one possible pair: width=1, height=min(1,1)=1, area=1
// Output: 1

console.log(maxWaterArea([4, 3, 2, 1, 4]));
// What's the best pair here? (Hint: it's not the two biggest numbers next to each other)

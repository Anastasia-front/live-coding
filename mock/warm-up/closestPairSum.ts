function closestPairSum(nums: number[], target: number): number {
  if (nums.length < 2) throw new Error("Need at least 2 numbers");

  const sorted = [...nums].sort((a, b) => a - b);
  let left = 0;
  let right = sorted.length - 1;
  let closestSum = sorted[left] + sorted[right];

  while (left < right) {
    const sum = sorted[left] + sorted[right];

    if (Math.abs(sum - target) < Math.abs(closestSum - target)) {
      closestSum = sum;
    }
    if (sum === target) return sum; // can't get any closer than exact

    if (sum < target) {
      left++; // sum too small — move left pointer up to increase it
    } else {
      right--; // sum too large — move right pointer down to decrease it
    }
  }

  return closestSum;
}

console.log(closestPairSum([2, 7, 11, 15], 13));
// Pairs: 2+7=9, 2+11=13, 2+15=17, 7+11=18, 7+15=22, 11+15=26
// 2+11=13 matches exactly → Output: 13

console.log(closestPairSum([1, 3, 4, 7, 10], 15));
// Closest sums to 15: 4+10=14, 7+10=17 → |15-14|=1, |15-17|=2 → 14 is closer
// Output: 14

console.log(closestPairSum([-5, -2, 3, 8], 0));
// What's the closest pair sum to 0 here?

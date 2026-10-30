const nextGreaterPalindrome = (n: string): string => {
  const num = BigInt(n);
  const length = n.length;

  const halfLength = Math.ceil(length / 2);
  const prefix = n.slice(0, halfLength);
  const mirrored = createPalindrome(prefix, length);

  if (BigInt(mirrored) > num) {
    return mirrored;
  }

  const nextPrefix = (BigInt(prefix) + 1n).toString();
  if (nextPrefix.length > halfLength) {
    return `1${"0".repeat(length - 1)}1`;
  }

  return createPalindrome(nextPrefix, length);
};

const createPalindrome = (left: string, originalLength: number): string => {
  let right = "";
  if (originalLength % 2 === 0) {
    right = left.split("").reverse().join("");
  } else {
    right = left.slice(0, -1).split("").reverse().join("");
  }
  return left + right;
};

console.log(nextGreaterPalindrome("123"));
console.log(nextGreaterPalindrome("808"));
console.log(nextGreaterPalindrome("999"));
console.log(nextGreaterPalindrome("12932"));
console.log(nextGreaterPalindrome("1"));

// Input: 123
// Output: 131
// Input: 808
// Output: 818
// Input: 999
// Output: 1001
// Input: 12932
// Output: 13031
// Input: 1
// Output: 2

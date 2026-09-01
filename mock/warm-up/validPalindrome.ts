function isValidPalindrome(s: string): boolean {
  const letters = /^[a-z0-9]/;
  const array = Array.from(s.toLocaleLowerCase());
  const normalized = array.filter((letter) => letters.test(letter));

  let left = 0;
  let right = normalized.length - 1;
  let result: boolean = true;

  while (left < right) {
    if (normalized[left] !== normalized[right]) {
      result = false;
      break;
    } else {
      left++;
      right--;
    }
  }

  return result;
}

// function isValidPalindrome(s: string): boolean {
//   const isAlphaNum = (c: string) => /[a-z0-9]/i.test(c);
//   let left = 0;
//   let right = s.length - 1;

//   while (left < right) {
//     while (left < right && !isAlphaNum(s[left])) left++;
//     while (left < right && !isAlphaNum(s[right])) right--;

//     if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
//     left++;
//     right--;
//   }
//   return true;
// }

console.log(isValidPalindrome("A man, a plan, a canal: Panama"));
// Stripped down to just letters/digits, lowercase: "amanaplanacanalpanama"
// That reads the same forwards and backwards
// Output: true

console.log(isValidPalindrome("race a car"));
// Stripped: "raceacar" — not the same reversed
// Output: false

console.log(isValidPalindrome(""));
// Output: ?

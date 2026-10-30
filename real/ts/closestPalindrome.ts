function solution(n: string): string {
  const num = BigInt(n);
  const len = n.length;
  const candidates = [];

  candidates.push(BigInt("9".repeat(len - 1) || "0"));
  candidates.push(BigInt("1" + "0".repeat(len - 1) + "1"));

  const halfLen = Math.ceil(len / 2);
  const prefix = BigInt(n.slice(0, halfLen));

  for (let change of [-1n, 0n, 1n]) {
    const left = (prefix + change).toString();
    const pal = makePalindrome(left, len);
    candidates.push(BigInt(pal));
  }

  let answer = null;

  for (let candidate of candidates) {
    if (candidate === num) continue;

    if (
      answer === null ||
      abs(candidate - num) < abs(answer - num) ||
      (abs(candidate - num) === abs(answer - num) && candidate < answer)
    ) {
      answer = candidate;
    }
  }

  return answer?.toString() || "";
}

function makePalindrome(left: string, originalLength: number) {
  let right;

  if (originalLength % 2 === 0) {
    right = left.split("").reverse().join("");
  } else {
    right = left.slice(0, -1).split("").reverse().join("");
  }

  return left + right;
}

function abs(x: bigint) {
  return x < 0n ? -x : x;
}

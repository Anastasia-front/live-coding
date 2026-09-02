export const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj));

// Related example:
// console.log(deepClone({ a: 1, b: { c: 2 } }));
// Output: { a: 1, b: { c: 2 } }


const deep1 = structuredClone(original);
// Modern (2022+), built into JS itself, no library needed.
// Handles Dates, Maps, Sets, circular references correctly. The current best default.

const deep2 = JSON.parse(JSON.stringify(original));
// The old, pre-structuredClone trick — has real gotchas:
// loses functions and `undefined` values entirely (silently dropped),
// converts Date objects to strings (not real Dates anymore),
// breaks/throws on circular references. Avoid if structuredClone is available.

// Manual recursive clone (rarely needed now, but worth knowing the concept exists):
function deepClone(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const copy = Array.isArray(obj) ? [] : {};
  for (const key in obj) copy[key] = deepClone(obj[key]);
  return copy;
}

// Lodash's _.cloneDeep(original) — a well-tested library option, common in older codebases
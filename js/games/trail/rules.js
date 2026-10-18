/* Trail rules on the player's path (list of cells from the 1). Pure functions. */
import { adjacent } from './engine/path.js';

/** Number (0 = the 1) of each cell, or -1. */
export const labels = (n, nums) => {
  const out = new Int16Array(n * n).fill(-1);
  nums.forEach((c, k) => { out[c] = k; });
  return out;
};

/** How many numbers the path has already reached (the next one it touches is that one). */
export const reached = (path, label) => path.reduce((k, c) => k + (label[c] >= 0 ? 1 : 0), 0);

/** Can the path be extended to cell `c`? Next to the end, free and, if it is a number, the right one. */
export function canExtend(n, path, label, c){
  if (!path.length || path.includes(c) || !adjacent(n, path[path.length - 1], c)) return false;
  return label[c] < 0 || label[c] === reached(path, label);
}

/** Solved: it goes through every cell and ends at the last number. */
export const isSolved = (n, nums, path) => path.length === n * n && path[path.length - 1] === nums[nums.length - 1];

/** First cell of the path that doesn't match the solution (it is unique), or -1. */
export const firstMistake = (path, solution) => path.findIndex((c, k) => c !== solution[k]);

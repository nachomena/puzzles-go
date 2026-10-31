/* Backup of the progress, to move it to another device or to keep it before reinstalling the app. There are no
   accounts and no server: the progress only lives in this device's storage, so the player carries it in a file.
   What travels: each game's statistics, history and settings, and the daily challenge log. Not the game in progress
   (its board carries the solution, so the file would give it away), nor Pro (it comes from the store purchase), nor
   the language and night mode (they belong to the device). No DOM. */

const APP = 'puzzles-go';
const VERSION = 1;
/** Largest file accepted, so a wrong one is refused before it is read. */
export const MAX_BYTES = 5_000_000;
const DAILY_KEY = 'puzzlesgo.daily';

/** Why a file is refused: `reason` is the key of its message. */
export class BackupError extends Error {
  constructor(reason){ super(reason); this.reason = reason; }
}

/** Storage keys that go into a backup. @param {{ storageKey: string }[]} metas */
export const backupKeys = metas => [...metas.map(m => m.storageKey), DAILY_KEY];

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

/** What stays out of a game's saved data: the boards kept ready (made again) and the game in progress (it holds the solution). */
const LEFT_OUT = ['buffers', 'cur'];
const withoutLeftOut = value => Object.fromEntries(Object.entries(value).filter(([k]) => !LEFT_OUT.includes(k)));

/** The file's text for the data saved under `keys`. */
export function exportBackup(storage, keys, now = new Date()){
  const data = {};
  for (const key of keys){
    let value = null;
    try { value = JSON.parse(storage?.getItem(key) || 'null'); } catch (e){ /* corrupt data: not exported */ }
    if (!isObject(value)) continue;
    data[key] = withoutLeftOut(value);
  }
  return JSON.stringify({ app: APP, version: VERSION, date: now.toISOString(), data });
}

/** Name of the file to save, e.g. puzzles-go-2026-10-30.json */
export const backupName = (now = new Date()) => `${APP}-${now.toISOString().slice(0, 10)}.json`;

/**
 * Reads a backup. Returns the entries to write: [[key, object]], only for known keys.
 * @throws {BackupError} 'format' (not a Puzzles Go file), 'newer' (made by a newer version), 'empty' (nothing to restore)
 */
export function parseBackup(text, keys){
  let file;
  try { file = JSON.parse(text); } catch (e){ throw new BackupError('format'); }
  if (!isObject(file) || file.app !== APP || !isObject(file.data)) throw new BackupError('format');
  if (!(file.version >= 1)) throw new BackupError('format');
  if (file.version > VERSION) throw new BackupError('newer');
  // a file from an earlier version may still carry the game in progress: it is not restored
  const entries = keys.filter(k => isObject(file.data[k])).map(k => [k, withoutLeftOut(file.data[k])]);
  if (!entries.length) throw new BackupError('empty');
  return entries;
}

/**
 * Writes the entries over what is saved. Everything or nothing: if the storage refuses one, the earlier ones are put back.
 * @returns {boolean} whether it could be written
 */
export function applyBackup(storage, entries){
  const before = entries.map(([key]) => [key, storage?.getItem(key) ?? null]);
  try {
    for (const [key, value] of entries) storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e){
    for (const [key, old] of before){
      try { old === null ? storage.removeItem(key) : storage.setItem(key, old); } catch (e2){ /* nothing more to do */ }
    }
    return false;
  }
}

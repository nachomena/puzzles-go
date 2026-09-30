/** Segundos → "m:ss". */
export const formatTime = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

/** "1 pista" / "3 pistas". */
export const plural = (n, word, suffix = 's') => `${n} ${word}${n === 1 ? '' : suffix}`;

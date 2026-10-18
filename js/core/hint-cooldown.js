/** Seconds of play left before another hint can be asked for (0 = available). */
export function hintWait(session, cooldown){
  if (session.hintAt == null) return 0;
  return Math.max(0, session.hintAt + cooldown - session.time);
}

/** Segundos de juego que faltan para poder pedir otra pista (0 = disponible). */
export function hintWait(session, cooldown){
  if (session.hintAt == null) return 0;
  return Math.max(0, session.hintAt + cooldown - session.time);
}

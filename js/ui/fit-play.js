/* La partida a la vista entera: si el tablero, los controles y la bandeja de piezas no caben en la
   altura de la pantalla, el tablero se estrecha lo justo (hasta MIN_SCALE de su ancho). Así no hay
   que desplazarse, que con la bandeja llena de piezas es difícil (tocar una pieza la arrastra). */
const MIN_SCALE = .7;

/** Ajusta la pantalla de juego `screen` (con su `.play-fit`). Se llama al abrirla y al cambiar el tamaño. */
export function fitPlay(screen){
  const box = screen.querySelector('.play-fit');
  if (!box) return;
  box.style.maxWidth = '';
  const full = box.getBoundingClientRect().width;
  // lo que sobra de alto se quita de ancho en proporción; un par de vueltas porque no todo escala
  for (let k = 0; k < 3; k++){
    const over = document.documentElement.scrollHeight - window.innerHeight;
    if (over <= 1) return;
    const r = box.getBoundingClientRect();
    const w = Math.max(full * MIN_SCALE, r.width - over * r.width / r.height);
    if (w >= r.width - .5) return;
    box.style.maxWidth = `${w}px`;
  }
}

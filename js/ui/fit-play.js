/* The whole game in view: if the board, the controls and the piece tray don't fit in the screen's
   height, the board narrows just enough (down to MIN_SCALE of its width). So there's no need to
   scroll, which is awkward with a tray full of pieces (touching a piece drags it). */
const MIN_SCALE = .7;

/** Fits the game screen `screen` (with its `.play-fit`). Called when it opens and when the size changes. */
export function fitPlay(screen){
  const box = screen.querySelector('.play-fit');
  if (!box) return;
  box.style.maxWidth = '';
  const full = box.getBoundingClientRect().width;
  // the extra height is taken off the width in proportion; a couple of passes because not everything scales
  for (let k = 0; k < 3; k++){
    const over = document.documentElement.scrollHeight - window.innerHeight;
    if (over <= 1) return;
    const r = box.getBoundingClientRect();
    const w = Math.max(full * MIN_SCALE, r.width - over * r.width / r.height);
    if (w >= r.width - .5) return;
    box.style.maxWidth = `${w}px`;
  }
}

/* Marcado propio de Smart Circle: tablero redondo, botones, bandeja de piezas y ayuda. */
import { iconButton } from '../../ui/templates.js';

const chip = (action, icon, text, label) =>
  `<button class="btn-chip" data-action="${action}" aria-label="${label}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${icon}"/></svg><span>${text}</span></button>`;

export const boardHtml = () =>
  `<div class="sl-area">` +
  `<div class="sl-board" data-sl-board role="application" aria-label="Tablero"><svg viewBox="-1.04 -1.04 2.08 2.08"></svg></div>` +
  `<div class="sl-actions">` +
  iconButton('reset', 'reset', 'Quitar todas las piezas') +
  `<div class="sl-actions__right">` +
  chip('turn-ribs', 'turn', 'Nervios', 'Girar los nervios del tablero') +
  chip('flip', 'flip', 'Voltear', 'Voltear la pieza seleccionada') +
  `</div></div></div>`;

export const controls = () =>
  `<div class="sl-tray" data-tray aria-label="Piezas sin colocar"></div>` +
  `<p class="sl-tip">Arrastra las piezas al tablero · toca para elegir y voltear</p>`;

export const help = () => `
  <p>Coloca las <b>10 piezas</b> en el tablero hasta llenar sus <b>48 agujeros</b>.</p>
  <ul>
    <li>Las bolas grandes van en el anillo de fuera, las medianas en el del medio y las pequeñas en el de dentro.</li>
    <li>Las piezas giran al moverlas alrededor del tablero y tienen dos caras: <b>Voltear</b> les da la vuelta.</li>
    <li>Los <b>nervios</b> del borde no se pueden cruzar: una pieza no puede unir dos bolas grandes a ambos lados de un nervio.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Principiante:</b> varias piezas ya colocadas.</li>
    <li><b>Fácil:</b> algunas piezas colocadas.</li>
    <li><b>Medio:</b> solo dos piezas colocadas.</li>
    <li><b>Difícil:</b> una o dos piezas, y no sabes cómo está girado el tablero: solo ves las marcas de algunos nervios en el borde. Gira los nervios con el botón <b>Nervios</b> hasta su sitio.</li>
    <li><b>Experto:</b> dos piezas y ninguna marca: también hay que encontrar dónde van los nervios.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y <b>Voltear</b> para darle la vuelta.</li>
    <li>La bombilla señala una pieza mal puesta, coloca los nervios o pone una pieza en su sitio. Hay una pista cada 10 minutos de juego.</li>
  </ul>`;

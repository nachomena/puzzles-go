/* Bucle común de los workers de generación: fabrica tableros hasta conseguir uno del
   nivel pedido. Los de otros niveles también se envían para aprovecharlos. */
import { runToEnd } from '../lib/iter.js';

/** Convierte `generate(target)` en un worker que responde al protocolo de PuzzleSupply. */
export function serveGenerator(generate){
  self.onmessage = ({ data }) => {
    if (data.ping){ self.postMessage({ pong: 1 }); return; }
    const { target, token } = data;
    for (;;){
      const p = runToEnd(generate(target));
      if (!p) continue;
      self.postMessage({ token, p });
      if (p.level === target) break;
    }
  };
}

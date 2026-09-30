/* Worker de generación: fabrica tableros hasta conseguir uno del nivel pedido.
   Los de otros niveles también se envían para aprovecharlos. */
import { generate, runToEnd } from './generator.js';

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

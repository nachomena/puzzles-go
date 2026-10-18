/* Shared loop of the generation workers: builds boards until it gets one of the requested
   level. Boards of other levels are sent too, so they aren't wasted. */
import { runToEnd } from '../lib/iter.js';

/** Turns `generate(target)` into a worker that answers PuzzleSupply's protocol. */
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

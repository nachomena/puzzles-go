/** Bytes of a base64 text (the precomputed data files). `atob` exists in browsers, workers and Node. */
export function decodeBase64(b64){
  const bin = atob(b64), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

import { proxyToOrigin } from '../_lib/origin-proxy.js';

export function onRequest(context) {
  return proxyToOrigin(context.request);
}

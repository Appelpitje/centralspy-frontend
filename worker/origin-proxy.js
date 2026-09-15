const ORIGIN_HOST = 'centralspy.appelpitje.dev';
const ORIGIN_IP = '178.105.150.25';

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = `https://${ORIGIN_HOST}${incoming.pathname}${incoming.search}`;
    const headers = new Headers(request.headers);
    headers.set('Host', ORIGIN_HOST);
    return fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
      cf: { resolveOverride: ORIGIN_IP },
    });
  },
};

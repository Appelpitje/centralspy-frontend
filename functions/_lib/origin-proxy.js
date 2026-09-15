const ORIGIN_HOST = 'centralspy.appelpitje.dev';

export function proxyToOrigin(request) {
  const incoming = new URL(request.url);
  const target = `https://${ORIGIN_HOST}${incoming.pathname}${incoming.search}`;
  const headers = new Headers(request.headers);
  headers.set('Host', ORIGIN_HOST);
  return fetch(target, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  });
}

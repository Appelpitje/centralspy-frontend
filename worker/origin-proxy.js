const ORIGIN = 'https://backend.mohpa.net';

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = `${ORIGIN}${incoming.pathname}${incoming.search}`;
    const headers = new Headers(request.headers);
    headers.delete('Host');
    return fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });
  },
};

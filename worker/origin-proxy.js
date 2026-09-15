const ORIGIN = 'http://178.105.150.25';

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = `${ORIGIN}${incoming.pathname}${incoming.search}`;
    return fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });
  },
};

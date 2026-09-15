export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws/')) {
      const origin = new URL(request.url);
      origin.hostname = 'centralspy.appelpitje.dev';
      origin.protocol = 'https:';
      return fetch(origin.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual',
        cf: { resolveOverride: '178.105.150.25' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};

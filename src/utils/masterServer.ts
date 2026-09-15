export interface MasterServerInfo {
  host: string;
  ip: string;
}

export const KNOWN_SERVERS: Record<string, { host: string; ip: string }> = {
  'mohpa.net': {
    host: '178.105.150.25',
    ip: '178.105.150.25',
  },
};

/**
 * Resolves the master server hostname and IPv4 address.
 * Web portal (portal.mohpa.net) is on Cloudflare Pages.
 * Game traffic (FESL & Theater) goes to the VPS IPv4, never to a Cloudflare hostname.
 */
export const resolveMasterServerInfo = (): MasterServerInfo => {
  const envHost = import.meta.env.VITE_MASTERSERVER_HOST;
  const envIp = import.meta.env.VITE_MASTERSERVER_IP;

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const currentHost = window.location.hostname;

    for (const [domain, info] of Object.entries(KNOWN_SERVERS)) {
      if (currentHost.includes(domain)) {
        return {
          host: envHost || info.host,
          ip: envIp || info.ip,
        };
      }
    }

    // Localhost / loopback
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return {
        host: envHost || '127.0.0.1',
        ip: envIp || '127.0.0.1',
      };
    }

    return {
      host: envHost || currentHost,
      ip: envIp || currentHost,
    };
  }

  return {
    host: envHost || '178.105.150.25',
    ip: envIp || '178.105.150.25',
  };
};

/**
 * Validates if string is an IPv4 address.
 */
export const isIpv4Address = (str: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(str.trim());
};

export interface MasterServerInfo {
  host: string;
  ip: string;
}

export const KNOWN_SERVERS: Record<string, { host: string; ip: string }> = {
  'appelpitje.dev': {
    host: 'centralspy.appelpitje.dev',
    ip: '178.105.150.25',
  },
};

/**
 * Resolves the master server hostname and IPv4 address.
 * Web portal (e.g. portal.appelpitje.dev) is separated from the master server (centralspy.appelpitje.dev).
 */
export const resolveMasterServerInfo = (): MasterServerInfo => {
  const envHost = import.meta.env.VITE_MASTERSERVER_HOST;
  const envIp = import.meta.env.VITE_MASTERSERVER_IP;

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const currentHost = window.location.hostname;

    // Check known domains (e.g. appelpitje.dev)
    for (const [domain, info] of Object.entries(KNOWN_SERVERS)) {
      if (currentHost.includes(domain)) {
        return {
          host: envHost || info.host,
          ip: envIp || info.ip,
        };
      }
    }

    // Portal subdomain convention: portal.example.com -> centralspy.example.com
    if (currentHost.startsWith('portal.')) {
      const derivedHost = currentHost.replace(/^portal\./i, 'centralspy.');
      return {
        host: envHost || derivedHost,
        ip: envIp || derivedHost,
      };
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

  // Default fallback for CentralSpy master server
  return {
    host: envHost || 'centralspy.appelpitje.dev',
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

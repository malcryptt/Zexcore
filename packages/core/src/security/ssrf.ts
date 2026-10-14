/**
 * Server-Side Request Forgery (SSRF) Protection
 *
 * Implements private IP range filtering and DNS resolution checks
 * as specified in ZexCore Security Model (docs/security.md §4).
 *
 * Blocks:
 *  - IPv4 Loopback: 127.0.0.0/8
 *  - IPv4 Private Class A: 10.0.0.0/8
 *  - IPv4 Private Class B: 172.16.0.0/12
 *  - IPv4 Private Class C: 192.168.0.0/16
 *  - IPv4 Link-Local / Cloud Metadata: 169.254.0.0/16 (e.g. 169.254.169.254)
 *  - IPv4 Current network / Broadcast: 0.0.0.0/8, 255.255.255.255
 *  - IPv6 Loopback: ::1
 *  - IPv6 Link-Local: fe80::/10
 *  - IPv6 Unique Local: fc00::/7
 */

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export function isPrivateIp(ip: string): boolean {
  // IPv4 checks
  if (ip.includes('.')) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true; // invalid IP shape: reject safely
    }

    const [a, b] = parts;

    // 0.0.0.0/8 (broadcast/local)
    if (a === 0) return true;

    // 127.0.0.0/8 (loopback)
    if (a === 127) return true;

    // 10.0.0.0/8 (RFC 1918)
    if (a === 10) return true;

    // 172.16.0.0/12 (RFC 1918: 172.16.0.0 – 172.31.255.255)
    if (a === 172 && b !== undefined && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16 (RFC 1918)
    if (a === 192 && b === 168) return true;

    // 169.254.0.0/16 (Link-local / AWS & Cloud Metadata)
    if (a === 169 && b === 254) return true;

    // 255.255.255.255 (Broadcast)
    if (parts.every((p) => p === 255)) return true;

    return false;
  }

  // IPv6 checks
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true; // fe80::/10
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // fc00::/7

  return false;
}

export async function validateSafeUrl(urlString: string): Promise<{ valid: boolean; reason?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  // Only allow http: and https: protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: `Disallowed protocol: ${parsed.protocol}. Only http and https are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and metadata names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === 'metadata.google.internal' ||
    hostname === 'instance-data'
  ) {
    return { valid: false, reason: 'Destination targets a reserved loopback or cloud metadata hostname.' };
  }

  // If hostname is directly an IP literal
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return { valid: false, reason: `Destination targets a private or link-local IP address (${hostname}).` };
    }
    return { valid: true };
  }

  // Resolve hostname via DNS to prevent DNS rebinding
  try {
    const addresses = await lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        return { valid: false, reason: `Hostname ${hostname} resolves to private or link-local IP (${addr.address}).` };
      }
    }
  } catch (err: any) {
    return { valid: false, reason: `DNS resolution failed for hostname ${hostname}: ${err?.message || 'unknown'}` };
  }

  return { valid: true };
}

export async function assertSafeUrl(urlString: string): Promise<void> {
  const result = await validateSafeUrl(urlString);
  if (!result.valid) {
    throw new Error(`SSRF Protection Blocked Request: ${result.reason}`);
  }
}

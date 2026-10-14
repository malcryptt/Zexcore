import { describe, it, expect } from 'vitest';
import { isPrivateIp, validateSafeUrl, assertSafeUrl } from '../../packages/core/src/security/ssrf.js';

describe('SSRF Protection & Network Action Defenses', () => {
  it('correctly identifies private IPv4 ranges', () => {
    // Loopback
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('127.255.255.254')).toBe(true);

    // RFC 1918 Class A
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('10.254.12.99')).toBe(true);

    // RFC 1918 Class B (172.16.0.0 – 172.31.255.255)
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('172.31.255.254')).toBe(true);
    expect(isPrivateIp('172.15.0.1')).toBe(false); // Public
    expect(isPrivateIp('172.32.0.1')).toBe(false); // Public

    // RFC 1918 Class C
    expect(isPrivateIp('192.168.1.1')).toBe(true);
    expect(isPrivateIp('192.168.100.250')).toBe(true);

    // Link-local & Cloud Metadata (169.254.169.254)
    expect(isPrivateIp('169.254.169.254')).toBe(true);
    expect(isPrivateIp('169.254.1.1')).toBe(true);

    // Local / Broadcast
    expect(isPrivateIp('0.0.0.0')).toBe(true);
    expect(isPrivateIp('255.255.255.255')).toBe(true);

    // Public IPs
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('1.1.1.1')).toBe(false);
    expect(isPrivateIp('93.184.216.34')).toBe(false);
  });

  it('correctly identifies private IPv6 ranges', () => {
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('fe80::1')).toBe(true);
    expect(isPrivateIp('fc00::1')).toBe(true);
    expect(isPrivateIp('fd12:3456:789a::1')).toBe(true);
  });

  it('blocks dangerous URL protocols and hostnames', async () => {
    // Protocol checks
    const fileResult = await validateSafeUrl('file:///etc/passwd');
    expect(fileResult.valid).toBe(false);
    expect(fileResult.reason).toContain('Disallowed protocol');

    const gopherResult = await validateSafeUrl('gopher://127.0.0.1:6379');
    expect(gopherResult.valid).toBe(false);

    // Localhost hostnames
    const localResult = await validateSafeUrl('http://localhost:8080/admin');
    expect(localResult.valid).toBe(false);
    expect(localResult.reason).toContain('loopback');

    // Cloud metadata
    const metaResult = await validateSafeUrl('http://169.254.169.254/latest/meta-data/');
    expect(metaResult.valid).toBe(false);
  });

  it('assertSafeUrl throws on invalid URLs and resolves on safe ones', async () => {
    await expect(assertSafeUrl('http://127.0.0.1:3000/internal')).rejects.toThrow('SSRF Protection Blocked');
    await expect(assertSafeUrl('http://10.0.1.5/admin')).rejects.toThrow('SSRF Protection Blocked');

    // Safe public IP destination (RFC 5737 / public IPv4)
    const safeResult = await validateSafeUrl('https://93.184.216.34/webhook');
    expect(safeResult.valid).toBe(true);
  });
});

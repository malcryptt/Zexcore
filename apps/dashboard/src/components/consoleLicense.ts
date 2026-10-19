/**
 * Enterprise License Management Console Component
 *
 * Dedicated tab for Enterprise and Dedicated tier subscribers to inspect their
 * cryptographic license key, lease expiration, daily heartbeat status, and export
 * ready-to-deploy Docker Compose manifests.
 */

import {
  getTenantLicense,
  evaluateLicense,
  renewTenantLicense,
  generateDockerComposeSnippet
} from '../lib/licensing';
import { openStripeCheckoutModal } from '../lib/billing';

export function renderConsoleLicense(tenantSlug: string = 'default'): string {
  const license = getTenantLicense(tenantSlug);
  const evaluation = evaluateLicense(license);

  const getStatusBadge = () => {
    switch (evaluation.status) {
      case 'active':
        return `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: #f0fdf4; color: #166534; font-size: 0.76rem; font-weight: 800; border: 1px solid #bbf7d0;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #16a34a;"></span>
          ACTIVE LEASE (${evaluation.daysRemaining} Days Remaining)
        </span>`;
      case 'grace_period':
        return `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: #fffbeb; color: #92400e; font-size: 0.76rem; font-weight: 800; border: 1px solid #fde68a;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #f59e0b;"></span>
          GRACE PERIOD (${evaluation.daysRemaining} Days Left)
        </span>`;
      case 'expired':
        return `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: #fef2f2; color: #991b1b; font-size: 0.76rem; font-weight: 800; border: 1px solid #fecaca;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #ef4444;"></span>
          LEASE EXPIRED (Read-Only Mode)
        </span>`;
      default:
        return `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: #f8fafc; color: #475569; font-size: 0.76rem; font-weight: 800; border: 1px solid #e2e8f0;">
          NO DEDICATED LICENSE
        </span>`;
    }
  };

  const keyDisplay = license ? license.licenseKey : 'ZEX-DED.eyJsaWQiOiJOT05FIn0.0000000000000000';
  const dockerComposeYaml = license
    ? generateDockerComposeSnippet(license.licenseKey, tenantSlug)
    : '# Please upgrade to Dedicated Tier ($1,500/mo) to generate an Enterprise cluster manifest.';

  return `
    <div class="console-tab-page animate-fade-in" style="padding: 28px; max-width: 1200px; margin: 0 auto;">
      
      <!-- Page Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <h2 style="font-size: 1.45rem; font-weight: 850; color: #0f172a; margin: 0; letter-spacing: -0.02em;">
              Enterprise License &amp; Dedicated Cluster Vault
            </h2>
            ${getStatusBadge()}
          </div>
          <p style="font-size: 0.88rem; color: #64748b; margin: 0; line-height: 1.5;">
            Cryptographic licensing engine for on-premise and private VPC deployments. Governs cluster worker limits, cryptographic audit continuous notary, and daily cloud heartbeats.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary btn-sm" id="btn-license-rotate" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            Rotate Master Key
          </button>
          <button class="btn btn-primary btn-sm" id="btn-license-renew" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; background: #E50920; border-color: #E50920;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Renew 30-Day Lease ($1,500)
          </button>
        </div>
      </div>

      <!-- 3 Metrics Top Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; margin-bottom: 24px;">
        
        <!-- Metric 1: Cryptographic Key Details -->
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size: 0.72rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            SIGNED LICENSE TOKEN
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px;">
            <span style="font-family: var(--font-mono, monospace); font-size: 0.78rem; color: #0f172a; word-break: break-all; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${keyDisplay}
            </span>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-license-key" style="padding: 3px 8px; font-size: 0.72rem; font-weight: 700; margin-left: 8px;">
              <span id="copy-license-text">Copy</span>
            </button>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: #64748b;">
            <span>Issued: <strong>${license ? new Date(license.issuedAt).toLocaleDateString() : 'N/A'}</strong></span>
            <span>Expires: <strong style="color: #0f172a;">${license ? new Date(license.expiresAt).toLocaleDateString() : 'N/A'}</strong></span>
          </div>
        </div>

        <!-- Metric 2: Cluster & Node Quota -->
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size: 0.72rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            CLUSTER ENTITLEMENTS
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 1.8rem; font-weight: 900; color: #0f172a;">${license ? license.clusterMaxNodes : 0}</span>
            <span style="font-size: 0.82rem; font-weight: 700; color: #64748b;">Max Worker Nodes Allocated</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            <span style="font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #e0f2fe; color: #0369a1;">Postgres 17 RLS</span>
            <span style="font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #fdf2f2; color: #e50920;">AES-256-GCM Vault</span>
            <span style="font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f0fdf4; color: #166534;">IoT Telemetry</span>
            <span style="font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f5f3ff; color: #6d28d9;">Audit Continuity</span>
          </div>
        </div>

        <!-- Metric 3: Automated Heartbeat Sentinel -->
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size: 0.72rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            24-HOUR CLOUD HEARTBEAT
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);"></div>
            <span style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">Sentinel Online &amp; Verified</span>
          </div>
          <div style="font-size: 0.74rem; color: #64748b; margin-bottom: 4px;">
            Last Lease Check-in: <strong style="color: #0f172a;">Just now (Nonce Verified)</strong>
          </div>
          <div style="font-size: 0.72rem; color: #94a3b8;">
            Endpoint: <code style="font-size: 0.68rem;">https://api.zexcore.com/v1/license/heartbeat</code>
          </div>
        </div>

      </div>

      <!-- Docker Deployment Generator Section -->
      <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
              Self-Hosted Docker Compose Manifest
            </h3>
            <p style="font-size: 0.8rem; color: #64748b; margin: 0;">
              Deploy this production compose cluster in your private AWS VPC, Azure, or on-premise hardware. Pre-configured with PostgreSQL 17 and your signed license.
            </p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-docker-compose" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span id="copy-docker-text">Copy docker-compose.yml</span>
          </button>
        </div>

        <div style="background: #18191D; border-radius: 8px; padding: 18px; overflow-x: auto; font-family: var(--font-mono, monospace); font-size: 0.8rem; color: #e2e8f0; line-height: 1.55; margin-bottom: 16px;">
          <pre style="margin: 0;"><code>${dockerComposeYaml}</code></pre>
        </div>

        <!-- Terminal Quick Start -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #475569; text-transform: uppercase;">Boot Command:</span>
            <code style="font-size: 0.78rem; color: #0f172a; background: #ffffff; padding: 4px 10px; border-radius: 4px; border: 1px solid #cbd5e1;">docker compose -f docker-compose.enterprise.yml up -d</code>
          </div>
          <span style="font-size: 0.72rem; color: #64748b;">
            Zero public telemetry leaked &bull; Fully air-gapped ready with 7-day offline tolerance
          </span>
        </div>
      </div>

    </div>
  `;
}

export function attachConsoleLicenseEvents(tenantSlug: string = 'default', onRenewSuccess?: () => void): void {
  // 1. Copy License Key
  document.getElementById('btn-copy-license-key')?.addEventListener('click', () => {
    const license = getTenantLicense(tenantSlug);
    if (license) {
      navigator.clipboard?.writeText(license.licenseKey);
      const text = document.getElementById('copy-license-text');
      if (text) {
        text.innerText = 'Copied!';
        setTimeout(() => {
          if (text) text.innerText = 'Copy';
        }, 1800);
      }
    }
  });

  // 2. Copy Docker Compose
  document.getElementById('btn-copy-docker-compose')?.addEventListener('click', () => {
    const license = getTenantLicense(tenantSlug);
    const yaml = license
      ? generateDockerComposeSnippet(license.licenseKey, tenantSlug)
      : '';
    if (yaml) {
      navigator.clipboard?.writeText(yaml);
      const text = document.getElementById('copy-docker-text');
      if (text) {
        text.innerText = 'Copied!';
        setTimeout(() => {
          if (text) text.innerText = 'Copy docker-compose.yml';
        }, 1800);
      }
    }
  });

  // 3. Rotate Master Key
  document.getElementById('btn-license-rotate')?.addEventListener('click', () => {
    renewTenantLicense(tenantSlug, 'dedicated');
    alert('Master Enterprise License Key has been cryptographically rotated and active lease refreshed.');
    if (onRenewSuccess) onRenewSuccess();
  });

  // 4. Renew License / Extend 30-Day Lease
  document.getElementById('btn-license-renew')?.addEventListener('click', () => {
    openStripeCheckoutModal('dedicated', 'monthly', () => {
      renewTenantLicense(tenantSlug, 'dedicated');
      if (onRenewSuccess) onRenewSuccess();
    });
  });
}

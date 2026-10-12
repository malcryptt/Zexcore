/**
 * IoT Schema Definitions
 *
 * Tables:
 *   iot_devices    – physical or virtual edge devices registered to a tenant
 *   iot_telemetry  – time-series metric data points ingested from devices
 *   iot_commands   – queued control commands dispatched to devices
 *   iot_alerts     – metric threshold configurations and alert conditions
 *
 * ALL tables enforce tenant_id isolation and RLS policies.
 */

export interface IotDevice {
  id: string;
  tenantId: string;
  deviceKey: string;
  name: string;
  kind: string;
  status: 'online' | 'offline' | 'unknown';
  firmwareVersion: string | null;
  tags: string[];
  meta: Record<string, unknown>;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IotTelemetry {
  id: string;
  tenantId: string;
  deviceId: string;
  metrics: Record<string, number | string | boolean>;
  recordedAt: Date;
}

export interface IotCommand {
  id: string;
  tenantId: string;
  deviceId: string;
  command: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'acknowledged' | 'failed';
  sentAt: Date | null;
  ackedAt: Date | null;
  createdAt: Date;
}

export interface IotAlert {
  id: string;
  tenantId: string;
  deviceId: string | null;
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'neq';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggeredAt: Date | null;
  createdAt: Date;
}

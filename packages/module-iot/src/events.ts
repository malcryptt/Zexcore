export const IOT_EVENTS = {
  DEVICE_REGISTERED:  'iot.device.registered',
  DEVICE_UPDATED:     'iot.device.updated',
  DEVICE_DELETED:     'iot.device.deleted',
  DEVICE_ONLINE:      'iot.device.online',
  DEVICE_OFFLINE:     'iot.device.offline',

  TELEMETRY_RECEIVED: 'iot.telemetry.received',  // fires on every ingest batch

  COMMAND_QUEUED:     'iot.command.queued',
  COMMAND_DELIVERED:  'iot.command.delivered',
  COMMAND_FAILED:     'iot.command.failed',

  ALERT_TRIGGERED:    'iot.alert.triggered',
  ALERT_RESOLVED:     'iot.alert.resolved',
} as const;

export type IotEventName = (typeof IOT_EVENTS)[keyof typeof IOT_EVENTS];

// ─── Payload shapes ────────────────────────────────────────────────────────────

export interface IotDeviceEventPayload {
  tenantId:  string;
  deviceId:  string;
  deviceKey: string;   // public identifier (not the secret token)
  kind:      string;
}

export interface IotTelemetryEventPayload {
  tenantId:  string;
  deviceId:  string;
  metrics:   Record<string, number | string | boolean>;
  recordedAt: string; // ISO 8601
}

export interface IotAlertEventPayload {
  tenantId:   string;
  alertId:    string;
  deviceId:   string;
  metric:     string;
  actualValue: number;
  threshold:  number;
  severity:   'low' | 'medium' | 'high' | 'critical';
}

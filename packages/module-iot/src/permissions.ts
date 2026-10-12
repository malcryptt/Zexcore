import type { CapabilityDefinition } from '@zexcore/core';

export const IOT_CAPABILITIES = {
  DEVICES_READ:     'iot:devices:read',
  DEVICES_MANAGE:   'iot:devices:manage',   // create / update / delete
  TELEMETRY_READ:   'iot:telemetry:read',
  TELEMETRY_INGEST: 'iot:telemetry:ingest', // POST from device or gateway
  COMMANDS_READ:    'iot:commands:read',
  COMMANDS_SEND:    'iot:commands:send',
  ALERTS_READ:      'iot:alerts:read',
  ALERTS_MANAGE:    'iot:alerts:manage',
} as const;

export type IotCapability = (typeof IOT_CAPABILITIES)[keyof typeof IOT_CAPABILITIES];

export const iotCapabilityDefinitions: CapabilityDefinition[] = [
  { name: IOT_CAPABILITIES.DEVICES_READ,     description: 'View registered IoT devices',         module: 'iot' },
  { name: IOT_CAPABILITIES.DEVICES_MANAGE,   description: 'Register, update, delete IoT devices', module: 'iot' },
  { name: IOT_CAPABILITIES.TELEMETRY_READ,   description: 'Read device telemetry data',           module: 'iot' },
  { name: IOT_CAPABILITIES.TELEMETRY_INGEST, description: 'Ingest telemetry from devices',        module: 'iot' },
  { name: IOT_CAPABILITIES.COMMANDS_READ,    description: 'View queued device commands',          module: 'iot' },
  { name: IOT_CAPABILITIES.COMMANDS_SEND,    description: 'Send commands to devices',             module: 'iot' },
  { name: IOT_CAPABILITIES.ALERTS_READ,      description: 'View IoT alerts',                      module: 'iot' },
  { name: IOT_CAPABILITIES.ALERTS_MANAGE,    description: 'Configure alert thresholds',           module: 'iot' },
];

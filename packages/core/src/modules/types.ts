import type { FastifyInstance } from 'fastify';
import type { CapabilityDefinition } from '../permissions/capabilities.js';
import type { ContentTypeSchema } from '../content/types.js';
import type { EventBus } from '../events/bus.js';
import type { DrizzleDb } from '../db/client.js';

export interface ModuleContentTypeDefinition {
  slug: string;
  name: string;
  description?: string;
  schemaJson: ContentTypeSchema;
  isSystem?: boolean;
}

export type ZexDbWrapper = DrizzleDb & {
  execute(query: any): Promise<any>;
};

export interface ZexCoreContext {
  db: ZexDbWrapper;
  events: EventBus;
  audit: {
    log(entry: any): Promise<void>;
  };
  logger: {
    info(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    debug(...args: any[]): void;
  };
}

export interface ZexModule {
  name: string;
  version: string;
  description?: string;
  dependsOn?: string[];
  permissions?: CapabilityDefinition[];
  contentTypes?: ModuleContentTypeDefinition[];
  
  registerRoutes?(server: FastifyInstance, core: ZexCoreContext): Promise<void> | void;
  onInit?(core: ZexCoreContext): Promise<void> | void;
  onShutdown?(core: ZexCoreContext): Promise<void> | void;
}

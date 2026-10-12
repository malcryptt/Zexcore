export interface ZexEvent<T = unknown> {
  name: string;
  tenantId: string;
  timestamp: Date;
  payload: T;
  sourceModule?: string;
  userId?: string;
}

export type EventHandler<T = unknown> = (event: ZexEvent<T>) => Promise<void> | void;

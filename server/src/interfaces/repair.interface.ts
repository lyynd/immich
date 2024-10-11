import { DatabaseAction, EntityType } from 'src/enum';

export const IRepairRepository = 'IRepairRepository';

export interface IAuditRepository {
  addRepair(since: Date, options: AuditSearch): Promise<string[]>;
}

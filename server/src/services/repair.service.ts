import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AUDIT_LOG_MAX_DURATION } from 'src/constants';
import { IEntityJob, JobStatus } from 'src/interfaces/job.interface';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class RepairService extends BaseService {
  async handleVerifyChecksum(job: IEntityJob): Promise<JobStatus> {
    const assetFile = await this.assetRepository.getFileById(job.id);
    if (!assetFile) {
      this.logger.error(`Asset file not found for id: ${job.id}`);
      return JobStatus.FAILED;
    }

    if (!assetFile.checksum) {
      this.logger.error(`Asset file has no checksum, cannot verify: ${job.id}`);
      return JobStatus.FAILED;
    }
    const currentChecksum = await this.cryptoRepository.xxHashFile(assetFile.path);
    if (currentChecksum.equals(assetFile.checksum)) {
      this.logger.log(`Asset file checksum verified: ${job.id}`);
    } else {
      this.logger.error(`Asset file checksum mismatch: ${job.id}`);
    }
    return JobStatus.SUCCESS;
  }
}

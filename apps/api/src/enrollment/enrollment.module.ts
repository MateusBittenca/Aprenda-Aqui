import { Global, Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';

@Global()
@Module({
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}

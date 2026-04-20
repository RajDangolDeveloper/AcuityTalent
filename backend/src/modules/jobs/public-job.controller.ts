import { Controller, Get, Param } from '@nestjs/common';
import { JobService } from './job.service';
import { JobResponseDto } from './dto/job-response.dto';

@Controller('public/jobs')
export class PublicJobController {
  constructor(private readonly jobService: JobService) {}

  @Get(':id')
  async getPublicJobById(
    @Param('id') id: string,
  ): Promise<{ statusCode: number; data: JobResponseDto }> {
    const job = await this.jobService.getPublicJobById(Number(id));

    return {
      statusCode: 200,
      data: job,
    };
  }
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateRecruiterProfileDto } from './CreateRecruiterProfile.dto';

export class UpdateRecruiterProfileDto extends PartialType(
  CreateRecruiterProfileDto,
) {}

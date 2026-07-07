import { ActionType } from '@prisma/client';
import { IsEnum, IsInt, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsInt()
  userId!: number;

  @IsEnum(ActionType)
  actionType!: ActionType;

  @IsString()
  activityTitle!: string;
}

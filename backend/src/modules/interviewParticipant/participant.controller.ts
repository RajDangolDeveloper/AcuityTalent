import {
  Injectable,
  Get,
  Body,
  Post,
  Patch,
  Delete,
  Controller,
} from '@nestjs/common';
import { CreateParticipantDto } from './dto/CreateParticipantDto';
import { DeleteParticipantDto } from './dto/DeleteParticipantDto';
import { FindAllParticipantDto } from './dto/FindAllParticipants.Dto';
import { FindParticipantDto } from './dto/FindParticipant.Dto';
import { UpdateParticipantDto } from './dto/UpdateParticipantDto';
import { InterviewParticipantService } from './participant.service';

@Injectable()
@Controller()
export class InterviewParticipantController {
  constructor(private readonly service: InterviewParticipantService) {}

  @Get()
  async findParticipant(@Body() dto: FindParticipantDto) {
    return this.service.findParticipant(dto.id);
  }

  @Get('all')
  async findAllParticipantByInterviewId(@Body() dto: FindAllParticipantDto) {
    return this.service.findAllParticipant(dto);
  }

  @Post()
  async createParticipant(@Body() dto: CreateParticipantDto) {
    return this.service.createParticipant(dto);
  }

  @Patch()
  async updateParticipant(@Body() dto: UpdateParticipantDto) {
    return this.service.updateParticipant(dto);
  }

  @Delete()
  async DeleteParticipantDto(@Body() dto: DeleteParticipantDto) {
    return this.service.deleteParticipant(dto);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RefType } from 'mongoose';

import { CurrentUser } from '~modules/auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '~modules/auth/guards/acces-token.guard';
import { RolesGuard } from '~modules/auth/guards/roles.guard';
import { ProjectByIdPipe } from '~modules/projects/pipes/project-by-id.pipe';
import { ProjectDocument } from '~modules/projects/project.schema';
import { UserDocument } from '~modules/users/user.schema';
import MongooseClassSerializerInterceptor from '~shared/interceptors/mongoSerializeInterceptor';

import { CreateSectionDto } from './dto/create-section.dto';
import { Section } from './section.schema';
import { SectionsService } from './sections.service';

@UseInterceptors(MongooseClassSerializerInterceptor(Section))
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('sections')
@ApiTags('section')
@ApiBearerAuth('Authorization')
export class SectionsController {
  constructor(private readonly sectionService: SectionsService) {}

  @Post()
  create(
    @CurrentUser() currentUser: UserDocument,
    @Body(ValidationPipe)
    createSectionDto: CreateSectionDto,
    @Body('title')
    title: string,
    @Body('project', ProjectByIdPipe)
    project: ProjectDocument,
  ) {
    return this.sectionService.create(createSectionDto, project, currentUser);
  }

  @Get()
  findAll() {
    return this.sectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: RefType, @CurrentUser() user: UserDocument) {
    return this.sectionService.findOne(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: RefType) {
    return this.sectionService.remove(id);
  }
}

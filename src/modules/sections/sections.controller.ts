import { RefType } from 'mongoose';
import { CurrentUser } from '~modules/auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '~modules/auth/guards/acces-token.guard';
import { RolesGuard } from '~modules/auth/guards/roles.guard';
import { ProjectByIdPipe } from '~modules/projects/pipes/project-by-id.pipe';
import { ProjectDocument } from '~modules/projects/projects.schema';
import { UserDocument } from '~modules/users/user.schema';
import MongooseClassSerializerInterceptor from '~shared/interceptors/mongoSerializeInterceptor';

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
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

import { CreateSectionDto } from './dto/create-section.dto';
import { SectionByIdPipe } from './pipes/section-by-id.pipe';
import { Section, SectionDocument } from './section.schema';
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
    @Body('projectId', ProjectByIdPipe)
    project: ProjectDocument,
  ) {
    return this.sectionService.create(createSectionDto, project, currentUser);
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  findOne(@Param('id') id: RefType, @CurrentUser() user: UserDocument) {
    return this.sectionService.findOne(id, user);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  remove(
    @Param('id', SectionByIdPipe) section: SectionDocument,
    @CurrentUser() user: UserDocument,
  ) {
    return this.sectionService.remove(section, user);
  }
}

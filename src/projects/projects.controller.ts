import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { RefType } from 'mongoose';
import { NullInterceptor } from 'src/shared/interceptors/null-interceptor';
import { ParseObjectIdPipe } from 'src/shared/pipes/objectid.pipe';
import MongooseClassSerializerInterceptor from 'src/shared/utils/mongoSerializeInterceptor';
import { UserByIdPipe } from 'src/users/pipes/user-by-id.pipe';
import { UserDocument } from 'src/users/user.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { Rights } from './enums/rights.enum';
import { ProjectByIdPipe } from './pipes/project-by-id.pipe';
import { Project, ProjectDocument } from './project.schema';
import { ProjectsService } from './projects.service';

@UseInterceptors(
  new NullInterceptor('Project'),
  MongooseClassSerializerInterceptor(Project),
)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body(ValidationPipe) createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ProjectByIdPipe) project: ProjectDocument) {
    return project;
  }

  @Patch(':id/users')
  updateUserRights(
    @Param('id', ParseObjectIdPipe) id: RefType,
    @Body('userId', UserByIdPipe) user: UserDocument,
    @Body('rights') rights: Rights[],
  ) {
    return this.projectsService.updateUserRights(id, user, rights);
  }

  @Post(':id/users')
  addUserToProject(
    @Param('id', ProjectByIdPipe) project: ProjectDocument,
    @Body('userId', UserByIdPipe) user: UserDocument,
  ) {
    return this.projectsService.addUserToProject(project, user);
  }

  @Delete(':id/users')
  removeUser(
    @Param('id', ParseObjectIdPipe) id: RefType,
    @Body('userId', UserByIdPipe) user: UserDocument,
  ) {
    return this.projectsService.removeUserFromProject(id, user);
  }
}

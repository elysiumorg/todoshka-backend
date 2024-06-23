import { RefType } from 'mongoose';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { ForbiddenException } from '@nestjs/common/exceptions';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '~modules/auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '~modules/auth/guards/acces-token.guard';
import { RolesGuard } from '~modules/auth/guards/roles.guard';
import { UserByIdPipe } from '~modules/users/pipes/user-by-id.pipe';
import { UserDocument } from '~modules/users/user.schema';
import { Rights } from '~shared/enums/rights.enum';
import MongooseClassSerializerInterceptor from '~shared/interceptors/mongoSerializeInterceptor';
import { NullInterceptor } from '~shared/interceptors/null-interceptor';
import { checkRights } from '~shared/utils/check-rights';

import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateTaskDto } from './dto/cteate-task.dto';
import { UpdateProjectUserDto } from './dto/update-project.dto';
import { ParseRightsPipe } from './pipes/parse-rights.pipe';
import { ProjectByIdPipe } from './pipes/project-by-id.pipe';
import { ProjectsService } from './projects.service';
import { Project, ProjectDocument } from './schemas/projects.schema';
import { Task } from './schemas/task.schema';

@UseInterceptors(
  new NullInterceptor('Project'),
  MongooseClassSerializerInterceptor(Project),
)
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('projects')
@ApiTags('projects')
@ApiBearerAuth('Authorization')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiCreatedResponse({ type: () => Project })
  async create(
    @Body(ValidationPipe) createProjectDto: CreateProjectDto,
    @CurrentUser() user: UserDocument,
  ) {
    const project = await this.projectsService.create(createProjectDto, user);
    return project.populate('users.user');
  }

  @Get()
  getProjects(@CurrentUser() user: UserDocument) {
    return this.projectsService.getUserProjects(user);
  }

  @ApiParam({ name: 'projectId' })
  @Get(':projectId')
  findOne(
    @Param('projectId', ProjectByIdPipe) project: ProjectDocument,
    @CurrentUser() currentUser: UserDocument,
  ) {
    if (!checkRights(project.users, currentUser)) {
      throw new ForbiddenException('You have no rights');
    }
    return project;
  }

  @ApiParam({ name: 'projectId' })
  @ApiBody({
    type: UpdateProjectUserDto,
  })
  @Patch(':projectId/users')
  updateUserRights(
    @Param('projectId', ProjectByIdPipe) project: ProjectDocument,
    @Body('userId', UserByIdPipe) user: UserDocument,
    @Body('rights', ParseRightsPipe) rights: Rights[] = [],
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.projectsService.updateUserRights(
      project,
      user,
      rights,
      currentUser,
    );
  }

  @ApiParam({ name: 'id' })
  @ApiBody({
    type: UpdateProjectUserDto,
  })
  @Post(':projectId/users')
  addUserToProject(
    @Param('projectId', ProjectByIdPipe) project: ProjectDocument,
    @Body('userId', UserByIdPipe) user: UserDocument,
    @Body('rights', ParseRightsPipe) rights: Rights[] = [],
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.projectsService.addUserToProject(
      project,
      user,
      rights,
      currentUser,
    );
  }

  @ApiParam({ name: 'id' })
  @ApiBody({
    type: UpdateProjectUserDto,
  })
  @Delete(':projectId/users')
  removeUserFromProject(
    @Param('projectId', ProjectByIdPipe) id: ProjectDocument,
    @Body('userId', UserByIdPipe) user: UserDocument,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.projectsService.removeUserFromProject(id, user, currentUser);
  }

  @ApiParam({ name: 'id' })
  @ApiBody({
    type: UpdateProjectUserDto,
  })
  @Delete(':projectId')
  deleteProject(
    @Param('projectId', ProjectByIdPipe) project: ProjectDocument,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.projectsService.deleteProject(project, currentUser);
  }

  @ApiParam({ name: 'projectId' })
  @Post(':projectId/section')
  createSection(
    @CurrentUser() currentUser: UserDocument,
    @Body(ValidationPipe)
    createSectionDto: CreateSectionDto,
    @Param('projectId', ProjectByIdPipe)
    project: ProjectDocument,
  ) {
    return this.projectsService.createSection(
      createSectionDto,
      project,
      currentUser,
    );
  }

  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'sectionId' })
  @Delete(':projectId/section/:sectionId')
  removeSection(
    @Param('projectId', ProjectByIdPipe) project,
    @Param('sectionId') sectionId: RefType,
    @CurrentUser() user: UserDocument,
  ) {
    return this.projectsService.removeSectionById(sectionId, project, user);
  }

  @ApiCreatedResponse({ type: Task })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'sectionId' })
  @Post(':projectId/section/:sectionId/task')
  addTask(
    @Param('projectId', ProjectByIdPipe) project,
    @Param('sectionId') sectionId: RefType,
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.projectsService.addTaskToSectionById(
      project,
      sectionId,
      createTaskDto,
      user,
    );
  }
}

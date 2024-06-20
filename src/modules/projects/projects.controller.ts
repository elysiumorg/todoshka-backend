import { CurrentUser } from '~modules/auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '~modules/auth/guards/acces-token.guard';
import { RolesGuard } from '~modules/auth/guards/roles.guard';
import { UserByIdPipe } from '~modules/users/pipes/user-by-id.pipe';
import { UserDocument } from '~modules/users/user.schema';
import { Rights } from '~shared/enums/rights.enum';
import MongooseClassSerializerInterceptor from '~shared/interceptors/mongoSerializeInterceptor';
import { NullInterceptor } from '~shared/interceptors/null-interceptor';
import { checkRights } from '~shared/utils/check-rights';

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
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectUserDto } from './dto/update-project.dto';
import { ParseRightsPipe } from './pipes/parse-rights.pipe';
import { ProjectByIdPipe } from './pipes/project-by-id.pipe';
import { Project, ProjectDocument } from './projects.schema';
import { ProjectsService } from './projects.service';

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

  @ApiParam({ name: 'id' })
  @Get(':id')
  findOne(
    @Param('id', ProjectByIdPipe) project: ProjectDocument,
    @CurrentUser() currentUser: UserDocument,
  ) {
    if (!checkRights(project.users, currentUser)) {
      throw new ForbiddenException('You have no rights');
    }
    return project;
  }

  @ApiParam({ name: 'id' })
  @ApiBody({
    type: UpdateProjectUserDto,
  })
  @Patch(':id/users')
  updateUserRights(
    @Param('id', ProjectByIdPipe) project: ProjectDocument,
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
  @Post(':id/users')
  addUserToProject(
    @Param('id', ProjectByIdPipe) project: ProjectDocument,
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
  @Delete(':id/users')
  removeUserFromProject(
    @Param('id', ProjectByIdPipe) id: ProjectDocument,
    @Body('userId', UserByIdPipe) user: UserDocument,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.projectsService.removeUserFromProject(id, user, currentUser);
  }

  @ApiParam({ name: 'id' })
  @ApiBody({
    type: UpdateProjectUserDto,
  })
  @Delete(':id')
  deleteProject(
    @Param('id', ProjectByIdPipe) project: ProjectDocument,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.projectsService.deleteProject(project, currentUser);
  }
}

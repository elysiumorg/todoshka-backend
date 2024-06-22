import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { ParseObjectIdPipe } from '~shared/pipes/objectid.pipe';

import { ProjectsService } from '../projects.service';

@Injectable()
export class ProjectByIdPipe implements PipeTransform<string> {
  constructor(private readonly projectService: ProjectsService) {}

  async transform(value: string) {
    ParseObjectIdPipe.validate(value);
    const project = await this.projectService
      .findById(value)
      .populate('users.user');

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
}

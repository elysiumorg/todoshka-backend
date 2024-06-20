import { ParseObjectIdPipe } from 'src/shared/pipes/objectid.pipe';

import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { ProjectsService } from '../projects.service';

@Injectable()
export class ProjectByIdPipe implements PipeTransform<string> {
  constructor(private readonly projectService: ProjectsService) {}

  async transform(value: string) {
    ParseObjectIdPipe.validate(value);
    const project = await this.projectService
      .findById(value)
      .populate('users.user sections');

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
}

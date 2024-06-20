import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { ParseObjectIdPipe } from 'src/shared/pipes/objectid.pipe';

import { ProjectsService } from '../projects.service';

@Injectable()
export class ProjectByIdPipe implements PipeTransform<string> {
  constructor(private readonly projectService: ProjectsService) {}

  async transform(value: string) {
    console.log(value);
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

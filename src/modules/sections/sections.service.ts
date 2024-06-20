import { Model, RefType } from 'mongoose';
import { ProjectDocument } from '~modules/projects/projects.schema';
import { UserDocument } from '~modules/users/user.schema';
import { Rights } from '~shared/enums/rights.enum';
import { checkRights } from '~shared/utils/check-rights';

import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';

import { Section, SectionDocument } from './section.schema';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
  ) {}

  async create(
    createSectionDto: { title: string },
    project: ProjectDocument,
    currentUser: UserDocument,
  ) {
    const right = checkRights(project.users, currentUser, [
      Rights.CREATE,
      Rights.OWNER,
    ]);

    if (!right) {
      throw new ForbiddenException('You have no rights');
    }

    const section = await this.sectionModel.create({
      project: project.id,
      title: createSectionDto.title,
    });
    return section.populate({
      path: 'project',
      populate: {
        path: 'users.user',
      },
    });
  }

  async findOne(id: RefType, currentUser: UserDocument) {
    const section = await this.sectionModel.findById(id).populate({
      path: 'project',
      populate: {
        path: 'users.user',
      },
    });

    if (!checkRights(section.project.users, currentUser)) {
      throw new ForbiddenException('You have no rights');
    }

    return section;
  }

  findById(id: RefType) {
    return this.sectionModel.findById(id).populate({ path: 'project' });
  }

  async remove(section: SectionDocument, currentUser: UserDocument) {
    const sectionPopulated = await section.populate({
      path: 'project',
      populate: {
        path: 'users.user',
      },
    });

    const right = checkRights(sectionPopulated.project.users, currentUser, [
      Rights.CREATE,
      Rights.OWNER,
    ]);

    if (!right) {
      throw new ForbiddenException('You have no rights');
    }

    return (await this.sectionModel.findByIdAndDelete(section.id)).populate({
      path: 'project',
      populate: {
        path: 'users.user',
      },
    });
  }
}

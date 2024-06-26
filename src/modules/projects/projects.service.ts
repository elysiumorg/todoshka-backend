import mongoose, { Model, RefType } from 'mongoose';

import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';

import { UserDocument } from '~modules/users/user.schema';
import { Rights } from '~shared/enums/rights.enum';
import { checkRights } from '~shared/utils/check-rights';

import { CreateProjectDto } from './dto/create-project.dto';
import { Project, ProjectDocument } from './schemas/projects.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  create(createProjectDto: CreateProjectDto, user: UserDocument) {
    return this.projectModel.create({
      ...createProjectDto,
      users: [{ user: user.id, rights: [Rights.OWNER] }],
    });
  }

  getUserProjects(user: UserDocument) {
    return this.projectModel
      .find({ 'users.user': { $eq: user.id } })
      .populate('users.user');
  }

  findById(id: RefType) {
    return this.projectModel.findById(id).populate({ path: 'users.user' });
  }

  async addUserToProject(
    project: ProjectDocument,
    user: UserDocument,
    rights: Rights[],
    currentUser: UserDocument,
  ) {
    if (checkRights(project.users, user)) {
      throw new BadRequestException('User is already exists');
    }

    if (!checkRights(project.users, currentUser, [Rights.OWNER])) {
      throw new ForbiddenException('You have no rights');
    }

    const a = await this.projectModel
      .findByIdAndUpdate(
        project.id,
        {
          $push: {
            users: { user: user.id, rights },
          },
        },
        { new: true, runValidators: true },
      )
      .populate('users.user');

    console.log(a);

    return a;
  }

  removeUserFromProject(
    project: ProjectDocument,
    user: UserDocument,
    currentUser: UserDocument,
  ) {
    if (!checkRights(project.users, user)) {
      throw new NotFoundException("User doesn't exist in this project");
    }

    if (!checkRights(project.users, currentUser, [Rights.OWNER])) {
      throw new ForbiddenException('You have no rights');
    }

    if (currentUser.id === user.id) {
      const otherOwner = project.users.find(
        (right) =>
          right.user.id !== currentUser.id &&
          right.rights.includes(Rights.OWNER),
      );

      if (!otherOwner) {
        throw new BadRequestException('Project have only one owner');
      }
    }

    return this.projectModel
      .findByIdAndUpdate(
        project.id,
        {
          $pull: {
            users: { user: user.id },
          },
        },
        { new: true },
      )
      .populate('users.user');
  }

  async updateUserRights(
    project: ProjectDocument,
    user: UserDocument,
    rights: Rights[],
    currentUser: UserDocument,
  ) {
    if (!checkRights(project.users, user)) {
      throw new NotFoundException("User doesn't exist in this project");
    }

    if (!checkRights(project.users, currentUser, [Rights.OWNER])) {
      throw new ForbiddenException('You have no rights');
    }

    if (currentUser.id === user.id && !rights.includes(Rights.OWNER)) {
      const otherOwner = project.users.findIndex(
        (right) =>
          right.user.id !== currentUser.id &&
          right.rights.includes(Rights.OWNER),
      );

      if (otherOwner < 0) {
        throw new BadRequestException('Project have only one owner');
      }
    }

    return this.projectModel
      .findByIdAndUpdate(
        project.id,
        {
          $set: {
            'users.$[element].rights': rights,
          },
        },
        { arrayFilters: [{ 'element.user': user._id }], new: true },
      )
      .populate('users.user');
  }

  async deleteProject(project: ProjectDocument, currentUser: UserDocument) {
    const right = checkRights(project.users, currentUser, [Rights.OWNER]);

    if (!right) {
      throw new ForbiddenException('You have no rights');
    }

    await project.deleteOne();
    return project;
  }

  async createSection(
    section: { title: string },
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

    return this.projectModel.findByIdAndUpdate(
      project.id,
      {
        $push: {
          sections: {
            id: new mongoose.Types.ObjectId().toString(),
            ...section,
          },
        },
      },
      { new: true },
    );
  }

  async removeSectionById(
    sectionId: RefType,
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

    return this.projectModel.findByIdAndUpdate(
      project.id,
      {
        $pull: {
          sections: { id: sectionId },
        },
      },
      { new: true },
    );
  }

  async addTaskToSectionById(
    project: ProjectDocument,
    sectionId: RefType,
    task: { title: string },
    currentUser: UserDocument,
  ) {
    const right = checkRights(project.users, currentUser, [
      Rights.CREATE,
      Rights.OWNER,
    ]);

    if (!right) {
      throw new ForbiddenException('You have no rights');
    }

    return this.projectModel
      .findByIdAndUpdate(
        project.id,
        {
          $push: {
            'sections.$[element].tasks': task,
          },
        },
        { arrayFilters: [{ 'element.id': sectionId }], new: true },
      )
      .populate('users.user');
  }
}

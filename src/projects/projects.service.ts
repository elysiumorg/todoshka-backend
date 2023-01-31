import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RefType } from 'mongoose';
import { User, UserDocument } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Rights } from './enums/rights.enum';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private readonly userService: UsersService,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    return this.projectModel.create(createProjectDto);
  }

  findAll() {
    return this.projectModel
      .find({})
      .populate({ path: 'users.user', model: 'User' });
  }

  findById(id: RefType) {
    return this.projectModel
      .findById(id)
      .populate({ path: 'users.user', model: 'User' });
  }

  addUserToProject(project: ProjectDocument, user: UserDocument) {
    if (project.users.some((el) => el.user._id == user.id)) {
      throw new BadRequestException('User is already exists');
    }
    return this.projectModel.findOneAndUpdate(
      { id: project.id, 'users.user': { $not: { $eq: user } } },
      {
        $push: {
          users: { user: user.id, rights: [] },
        },
      },
      { new: true },
    );
  }

  removeUserFromProject(id: RefType, user: UserDocument) {
    return this.projectModel.findOneAndUpdate(
      { id },
      {
        $pull: {
          users: { user: user.id },
        },
      },
      { new: true },
    );
  }

  async updateUserRights(id: RefType, user: User, rights: Rights[]) {
    return this.projectModel.findOneAndUpdate(
      { id, users: { user: user._id } },
      {
        $set: {
          'users.$[element].rights': rights,
        },
      },
      { arrayFilters: [{ 'element.user': user._id }], new: true },
    );
  }
}

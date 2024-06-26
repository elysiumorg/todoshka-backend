import { Model, RefType } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '~modules/users/user.schema';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create(createUserDto);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find();
  }

  async findById(id: RefType): Promise<UserDocument> {
    return await this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  async findByLogin(login: string): Promise<UserDocument> {
    return this.userModel.findOne({ login: login.toLowerCase() });
  }

  async update(id: RefType, update: UpdateUserDto): Promise<UserDocument> {
    return await this.userModel.findByIdAndUpdate(id, update, { new: true });
  }

  async remove(id: RefType) {
    return await this.userModel.findByIdAndDelete(id);
  }
}

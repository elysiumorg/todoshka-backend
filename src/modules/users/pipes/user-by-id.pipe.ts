import { ParseObjectIdPipe } from '~shared/pipes/objectid.pipe';

import { Injectable, PipeTransform } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';

import { UsersService } from '../users.service';

@Injectable()
export class UserByIdPipe implements PipeTransform<string> {
  constructor(private readonly usersService: UsersService) {}

  async transform(value: string) {
    ParseObjectIdPipe.validate(value);
    const user = await this.usersService.findById(value);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

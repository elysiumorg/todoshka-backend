import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';

import { ParseObjectIdPipe } from '~shared/pipes/objectid.pipe';

import { UsersService } from '../users.service';

@Injectable()
export class UserByIdPipe
  extends ParseObjectIdPipe
  implements PipeTransform<string>
{
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async transform(value: string, metadata: ArgumentMetadata) {
    super.transform(value, metadata);
    const user = await this.usersService.findById(value);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

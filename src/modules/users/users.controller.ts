import { RefType } from 'mongoose';
import { CurrentUser } from '~modules/auth/decorators/current-user.decorator';
import { Roles } from '~modules/auth/decorators/roles.decorator';
import { Role } from '~modules/auth/enums/role.enum';
import { AccessTokenGuard } from '~modules/auth/guards/acces-token.guard';
import { RolesGuard } from '~modules/auth/guards/roles.guard';
import MongooseClassSerializerInterceptor from '~shared/interceptors/mongoSerializeInterceptor';
import { NullInterceptor } from '~shared/interceptors/null-interceptor';
import { ParseObjectIdPipe } from '~shared/pipes/objectid.pipe';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserByIdPipe } from './pipes/user-by-id.pipe';
import { User, UserDocument } from './user.schema';
import { UsersService } from './users.service';

@UseInterceptors(
  new NullInterceptor('User'),
  MongooseClassSerializerInterceptor(User),
)
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('users')
@ApiTags('users')
@ApiBearerAuth('Authorization')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Get('/me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findById(@Param('id', UserByIdPipe) user: UserDocument) {
    return user;
  }

  @Patch('/me')
  updateMe(
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @CurrentUser() id: RefType,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', UserByIdPipe) id: RefType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: RefType) {
    return this.usersService.remove(id);
  }
}

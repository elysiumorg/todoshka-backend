import { RefType } from 'mongoose';

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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '~modules/auth/decorators/current-user.decorator';
import { Roles } from '~modules/auth/decorators/roles.decorator';
import { Role } from '~modules/auth/enums/role.enum';
import { AccessTokenGuard } from '~modules/auth/guards/acces-token.guard';
import { RolesGuard } from '~modules/auth/guards/roles.guard';
import MongooseClassSerializerInterceptor from '~shared/interceptors/mongoSerializeInterceptor';
import { NullInterceptor } from '~shared/interceptors/null-interceptor';
import { ParseObjectIdPipe } from '~shared/pipes/objectid.pipe';

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
@ApiExtraModels(User)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/me')
  @ApiOkResponse({ type: User })
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: User })
  findById(@Param('id', UserByIdPipe) user: UserDocument) {
    return user;
  }

  @Patch('/me')
  @ApiOkResponse({ type: User })
  updateMe(
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @CurrentUser() id: RefType,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: User })
  update(
    @Param('id', UserByIdPipe) id: RefType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: User })
  remove(@Param('id', ParseObjectIdPipe) id: RefType) {
    return this.usersService.remove(id);
  }
}

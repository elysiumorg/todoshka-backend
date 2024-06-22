import { Exclude, Type } from 'class-transformer';
import mongoose, { isObjectIdOrHexString, ObjectId } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '~modules/users/user.schema';
import { Rights } from '~shared/enums/rights.enum';

@Schema({
  toJSON: {
    virtuals: true,
  },
  id: false,
  _id: false,
})
export class UserRights {
  @Exclude()
  _id: ObjectId;

  @ApiProperty({ type: () => User })
  @Type((type) => {
    if (isObjectIdOrHexString(type.object.user)) return String;
    return () => User;
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @ApiProperty({ enumName: 'Rights', enum: Rights })
  @Prop({ type: () => Array<Rights>, default: [] })
  rights: Rights[];
}

export const UserRightsSchema = SchemaFactory.createForClass(UserRights);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import mongoose, { ObjectId, isObjectIdOrHexString } from 'mongoose';

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
  @Type((type) => {
    if (isObjectIdOrHexString(type.object.user)) return String;
    return User;
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
  @Prop({ type: Array<Rights>, default: [] })
  rights: Rights[];
}

export const UserRightsSchema = SchemaFactory.createForClass(UserRights);

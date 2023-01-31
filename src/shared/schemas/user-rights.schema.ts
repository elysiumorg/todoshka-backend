import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import mongoose, { ObjectId } from 'mongoose';
import { Rights } from 'src/projects/enums/rights.enum';
import { User } from 'src/users/user.schema';

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
  @Type((type) => User)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
  @Prop({ type: Array<Rights>, enum: ['aaa'], default: [] })
  rights: Rights[];
}

export const UserRightsSchema = SchemaFactory.createForClass(UserRights);

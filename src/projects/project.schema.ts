import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform, Type } from 'class-transformer';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/user.schema';
import { Rights } from './enums/rights.enum';

export type ProjectDocument = Project & Document;

class UserRights {
  @Type(() => User)
  user: User;
  rights: Rights[];
}

@Schema()
export class Project {
  @Transform(({ obj }) => obj._id.toString())
  _id: string;
  @Exclude()
  __v: number;
  @Prop({ required: true })
  title: string;
  @Type(() => UserRights)
  @Prop({
    user: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          rights: { type: Array<Rights>, default: [] },
        },
      ],
    },
    default: [],
  })
  users: Array<{ user: User; rights: number }>;
  @Prop({ default: Date.now() })
  createdDate: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

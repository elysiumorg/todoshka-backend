import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import {
  UserRights,
  UserRightsSchema,
} from 'src/shared/schemas/user-rights.schema';

export type ProjectDocument = Project & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Project {
  @Exclude()
  _id: ObjectId;
  @Exclude()
  __v: number;
  @Prop({ required: true })
  title: string;
  @Type(() => UserRights)
  @Prop({
    type: [UserRightsSchema],
    default: [],
  })
  users: UserRights[];
  @Prop({ default: Date.now() })
  createdDate: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

import { Exclude, Type } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import {
  UserRights,
  UserRightsSchema,
} from '~shared/schemas/user-rights.schema';

import { Section, SectionSchema } from './section.schema';

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

  @ApiProperty({ type: String })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ type: () => [UserRights] })
  @Type(() => UserRights)
  @Prop({
    type: () => [UserRightsSchema],
    default: [],
    select: true,
  })
  users: UserRights[];

  @ApiProperty({ type: Date })
  @Prop({ default: Date.now() })
  createdDate: Date;

  @ApiProperty({ type: () => [Section] })
  @Type(() => Section)
  @Prop({
    type: () => [SectionSchema],
    default: [],
    select: true,
  })
  sections: Section[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

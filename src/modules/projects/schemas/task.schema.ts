import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TaskDocument = Task & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
  id: true,
})
export class Task {
  @Exclude()
  _id: string;

  @Exclude()
  __v: number;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  title: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

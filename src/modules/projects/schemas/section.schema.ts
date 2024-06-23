import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SectionDocument = Section & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
  id: true,
})
export class Section {
  @Exclude()
  _id: string;

  @Exclude()
  __v: number;

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  title: string;
}

export const SectionSchema = SchemaFactory.createForClass(Section);

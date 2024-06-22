import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from '~modules/auth/enums/role.enum';

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class User {
  @ApiProperty({ type: String, description: 'Id в формате ObjectId' })
  id: string;
  @Exclude()
  _id: string;
  @Exclude()
  __v: number;
  @ApiProperty({ type: 'string' })
  @Prop({ required: true, maxlength: 32 })
  firstname: string;
  @ApiProperty({ type: 'string' })
  @Prop({ required: true, maxlength: 32 })
  lastname: string;
  @ApiProperty({ type: 'string' })
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;
  @ApiProperty({ type: 'string' })
  @Prop({ required: true, unique: true, lowercase: true })
  login: string;
  @Exclude()
  @Prop({ required: true })
  password: string;
  @ApiProperty({ enumName: 'Role', enum: Role })
  @Prop({ required: true, default: [Role.USER] })
  roles: Array<Role>;
  @ApiProperty({ type: 'string' })
  @Prop({ default: Date.now() })
  createdDate: Date;
  @ApiProperty({ type: 'string' })
  fullname: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('fullname')
  .get(function (this: UserDocument) {
    return `${this.firstname} ${this.lastname}`;
  })
  .set(function (this: UserDocument, fullname: string) {
    const [firstname, lastname] = fullname.split(' ');
    this.set({ firstname, lastname });
  });

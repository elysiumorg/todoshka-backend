import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import { Document } from 'mongoose';

import { Role } from '~modules/auth/enums/role.enum';
import { Project } from '~modules/projects/project.schema';

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class User {
  id: string;
  @Exclude()
  _id: string;
  @Exclude()
  __v: number;
  @Prop({ required: true, maxlength: 32 })
  firstname: string;
  @Prop({ required: true, maxlength: 32 })
  lastname: string;
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;
  @Exclude()
  @Prop({ required: true })
  password: string;
  @Prop({ required: true, default: [Role.USER] })
  roles: Array<Role>;
  @Prop({ default: Date.now() })
  createdDate: Date;
  @Type(() => Project)
  projects: Project[];
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

UserSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'users.user',
});

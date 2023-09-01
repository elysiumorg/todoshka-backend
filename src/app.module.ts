import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AuthModule,
  ProjectsModule,
  SectionsModule,
  TasksModule,
  UsersModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.dev'] }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
    AuthModule,
    ProjectsModule,
    SectionsModule,
    TasksModule,
  ],
})
export class AppModule {}

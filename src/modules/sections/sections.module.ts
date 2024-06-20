import { ProjectsModule } from '..';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Section, SectionSchema } from './section.schema';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Section.name, schema: SectionSchema }]),
    ProjectsModule,
  ],
  controllers: [SectionsController],
  providers: [SectionsService],
})
export class SectionsModule {}

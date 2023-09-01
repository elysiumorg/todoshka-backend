import { Module } from '@nestjs/common';

import { ProjectsModule } from '~modules/projects/projects.module';

import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Section, SectionSchema } from './section.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Section.name, schema: SectionSchema }]),
    ProjectsModule,
  ],
  controllers: [SectionsController],
  providers: [SectionsService],
})
export class SectionsModule {}

import { ParseObjectIdPipe } from 'src/shared/pipes/objectid.pipe';

import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { SectionsService } from '../sections.service';

@Injectable()
export class SectionByIdPipe implements PipeTransform<string> {
  constructor(private readonly sectionService: SectionsService) {}

  async transform(value: string) {
    ParseObjectIdPipe.validate(value);
    const section = await this.sectionService.findById(value);

    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }
}

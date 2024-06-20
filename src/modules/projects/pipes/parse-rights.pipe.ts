import { Rights } from '~shared/enums/rights.enum';

import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseRightsPipe implements PipeTransform<Rights[]> {
  async transform(value: Rights[]) {
    return value.map((right) => {
      const t = right.toLocaleUpperCase();
      if (!(t in Rights)) {
        throw new BadRequestException('Bad rights array');
      }
      return t;
    });
  }
}

import { PartialType } from '@nestjs/swagger';

import { CreateProjectDto } from './create-project.dto';
import { Rights } from '~src/shared/enums/rights.enum';
import { IsAlphanumeric, IsArray, IsEnum, Length } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class UpdateProjectUserDto {
  @IsAlphanumeric()
  @Length(24)
  userId: string;
  @IsArray()
  @IsEnum(Rights)
  rights: Rights[];
}

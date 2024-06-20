import { IsArray, IsEnum, IsHexadecimal, Length } from 'class-validator';
import { Rights } from '~src/shared/enums/rights.enum';

import { PartialType } from '@nestjs/swagger';

import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class UpdateProjectUserDto {
  @IsHexadecimal()
  @Length(24)
  userId: string;
  @IsArray()
  @IsEnum(Rights)
  rights: Rights[];
}

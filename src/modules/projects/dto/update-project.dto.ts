import { IsArray, IsEnum, IsHexadecimal, Length } from 'class-validator';

import { ApiProperty, PartialType } from '@nestjs/swagger';

import { Rights } from '~shared/enums/rights.enum';

import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class UpdateProjectUserDto {
  @IsHexadecimal()
  @Length(24)
  userId: string;
  @IsArray()
  @IsEnum(Rights)
  @ApiProperty({ type: () => [Rights], enumName: 'Rights', enum: Rights })
  rights: Rights[];
}

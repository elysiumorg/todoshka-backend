import { IsHexadecimal, IsString } from 'class-validator';

import { PickType } from '@nestjs/swagger';

export class CreateSectionDto {
  @IsString()
  title: string;
  @IsHexadecimal()
  projectId: string;
}

export class CreateSectionFromProjectDto extends PickType(CreateSectionDto, [
  'title',
]) {}

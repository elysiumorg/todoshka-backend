import { IsHexadecimal, IsString } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  title: string;
}

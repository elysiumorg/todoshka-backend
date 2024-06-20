import { IsAlpha, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsAlpha()
  firstname: string;
  @IsAlpha()
  lastname: string;
  @IsEmail()
  email: string;
  @IsAlpha()
  login: string;
  @IsNotEmpty()
  password: string;
}

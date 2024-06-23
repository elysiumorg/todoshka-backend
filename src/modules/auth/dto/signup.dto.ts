import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto {
  @IsString()
  firstname: string;
  @IsString()
  lastname: string;
  @IsEmail()
  email: string;
  @IsAlphanumeric()
  login: string;
  @IsNotEmpty()
  password: string;
}

import { IsAlpha, IsEmail, IsNotEmpty } from 'class-validator';

export class SignupDto {
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

import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

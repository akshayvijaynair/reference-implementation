import {IsEmail, IsOptional, IsString} from 'class-validator';


export class User {
  @IsOptional() // Mark id as optional to avoid errors
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  userName: string;
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    company_name: string;
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    username: string;
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    password: string;
}
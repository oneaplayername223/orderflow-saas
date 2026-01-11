import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginUserDto {
    ip: string;
    @IsString()
    @IsNotEmpty()
    username: string;
    @IsString()
    @IsNotEmpty()
    password: string;
}
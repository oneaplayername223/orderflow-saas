import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Type(() => Number)
    page: number
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Type(() => Number)
    limit: number
}
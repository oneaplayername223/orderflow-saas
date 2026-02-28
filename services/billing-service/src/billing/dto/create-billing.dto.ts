import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBillingDto {
    @IsNumber()
    accountId: number = 0;
    amount?: number;
    accountType?: string;
    createdAt?: Date;
    expireAt?: Date;
}
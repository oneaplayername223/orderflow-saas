import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class CreatePaymentDto {
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    orderItemPrice: number;
    @IsNumber()
    @IsNotEmpty()
    companyId: number;
    @IsNumber()
    @IsNotEmpty()
    orderId: number;
    orderItems: any;
    orderQuantity: number;
}


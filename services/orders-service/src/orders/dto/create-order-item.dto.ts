import { Decimal } from "@prisma/client/runtime/library";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  referenceName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  unitPrice: number;

  @IsNotEmpty()
  subtotal: number;
}
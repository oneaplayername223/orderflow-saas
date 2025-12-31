import { Decimal } from "@prisma/client/runtime/library";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus, OrderType } from "@prisma/client";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class CreateOrderDto {
  @IsEnum(OrderType)
  type: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus = OrderStatus.CREATED;

  @IsNotEmpty()
  totalAmount: Decimal;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  assignedTo?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

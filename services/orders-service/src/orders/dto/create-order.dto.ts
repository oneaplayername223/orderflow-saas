import { Decimal } from "@prisma/client/runtime/library";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type, Transform as TransformDecorator } from "class-transformer";
import { OrderStatus, OrderType } from "@prisma/client";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class CreateOrderDto {
  @IsEnum(OrderType)
  @IsNotEmpty()
  type: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus = OrderStatus.CREATED;

  @IsNotEmpty()
  @TransformDecorator(({ value }) => new Decimal(value))
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

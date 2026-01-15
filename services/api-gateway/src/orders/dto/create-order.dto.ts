import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus, OrderType} from "./../../enums/orders.enums";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class CreateOrderDto {

  @IsEnum(OrderType)
  @IsNotEmpty()
  type: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus = OrderStatus.CREATED;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  assignedTo?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

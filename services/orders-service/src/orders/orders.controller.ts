import { Controller } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices';
import { PaginationDto } from './dto/pagination.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
    @MessagePattern('create-order')
    
    async createOrder(@Payload() payload: any) {

        const order = await this.ordersService.create(payload);
        if (!order) {
            throw new RpcException('Order not created');
        }
       return order

    }

    @MessagePattern('update-order')
    async updateOrder(@Payload() payload: any) {
        const order = await this.ordersService.updateOrder(payload);
        return order

    }

    @MessagePattern('checkout-order')
    async checkoutOrder(@Payload() payload: any) {
        return await this.ordersService.checkoutOrder(payload);
    }
    @MessagePattern('get-order')
    async getOrder(@Payload() payload: any) {
        const order = await this.ordersService.getOrder(payload);
        return order
    }

    @MessagePattern('get-orders')
    async getOrders(@Payload() Payload: PaginationDto) {

        const orders = await this.ordersService.getOrders(Payload);
        return orders
    }
}

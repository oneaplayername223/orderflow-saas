import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { ClientProxy, Ctx } from '@nestjs/microservices';
import { AuthGuard } from '../guards/auth/auth.guard';
import { PaginationDto } from './dto/pagination.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(@Inject('ORDERS_SERVICE') private readonly ordersService: ClientProxy) {}


  @Post()
  @UseGuards(AuthGuard)
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any, @Ctx() context: any) {
  
  const createOrder = {user_id: req.user, ...createOrderDto};
  return this.ordersService.send('create-order', createOrder);
  }

  @Get()
  @UseGuards(AuthGuard)
  @SetMetadata('roles', ['USER', 'NORMAL', 'PRO', 'ENTERPRISE', 'TRIAL'])

  async getOrders(@Req() req: any, @Query('limit') limit: PaginationDto, @Query('page') page: PaginationDto, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const pagination = {limit: limit? limit : 10, page: page? page : 1};
    const user_id = req.user?.accountId
    const dateFilter = { startDate, endDate };
    const payload = {pagination, user_id, dateFilter};
    return await this.ordersService.send('get-orders', payload);
  }

  @Post('checkout/:id')
  @UseGuards(AuthGuard)
  checkout(@Body() checkoutDto: any, @Req() req: any, @Param('id') orderId: number) {
    const payload = {accountId: req.user.accountId, ...checkoutDto, orderId};
    return this.ordersService.send('checkout-order', payload);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateOrder(@Body() body: { status: string }, @Param('id') orderId: number, @Req() req: any) {
    const userId = req.user?.accountId
    const updateStatusDto = { status: body.status }
    const payload = {orderId, updateStatusDto, userId};
    return this.ordersService.send('update-order', payload);
 
 
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getOrder(@Param('id') getOrderDto: number, @Req() req: any) {
    const payload = {orderId: getOrderDto, userId: req.user?.accountId};
    return this.ordersService.send('get-order', payload);
  }



}

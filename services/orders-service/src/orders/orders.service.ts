import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from './prisma/prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, 
@Inject('PAYMENTS_SERVICE') private readonly paymentsService: ClientProxy, 
@Inject('NOTIFICATION_SERVICE') private readonly notificationService: ClientProxy) {}

  async create(payload: any) {
    const companyId = payload.user_id.accountId;
    const userId = payload.user_id.userId;

    const { user_id, ...dtoData } = payload;

    const createOrderDto = {
      ...dtoData,
      totalAmount: new Decimal(dtoData.totalAmount),
      items: dtoData.items.map((item: any) => ({
        ...item,
        unitPrice: new Decimal(item.unitPrice),
        subtotal: new Decimal(item.quantity * Number(item.unitPrice))
      }))
    };

    
    return await this.prisma.order.create({
      data: {
        type: createOrderDto.type,
        status: createOrderDto.status || OrderStatus.CREATED,
        totalAmount: createOrderDto.totalAmount,
        createdBy: userId,
        assignedTo: createOrderDto.assignedTo,
        companyId,
        items: {
          create: createOrderDto.items.map((item: any) => ({
            referenceName: item.referenceName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

async updateOrder(payload: any) {
    
const userId: number = payload.userId
const status: OrderStatus = payload.updateStatusDto.status

if (status === OrderStatus.COMPLETED) throw new RpcException('You cannot edit an order to complete it');
if (status === OrderStatus.CONFIRMED) throw new RpcException('You cannot change the status of a confirmed order');

const {updateStatusDto} = payload
 const id = Number(payload.orderId)
const order = await this.prisma.order.update({where: {id: id, companyId: userId}, data: {status}});

if (!order) throw new RpcException('Order not found');

return order
}

async checkoutOrder(payload: any) {
const companyId = payload.accountId
const status = 'CONFIRMED'
const orderQuantity = Number(payload.quantity)

if (!orderQuantity) throw new RpcException('Order quantity is not valid');
const order = await this.prisma.order.update({where: {id: Number(payload.orderId), companyId: Number(companyId)}, data: {status}});

if (!order) throw new RpcException('Order not found');

const orderId = Number(payload.orderId)
const orderItems = await this.prisma.orderItem.findMany({where: {orderId: orderId}});
const quantity = orderItems.reduce((total, item) => total + item.quantity, 0);
const orderItemPrice = orderItems.reduce((total, item) => total + Number(item.subtotal as Prisma.Decimal), 0).toFixed(2);

if (quantity < orderQuantity) throw new RpcException('Order quantity is not enough');
const orderItem = await this.prisma.orderItem.updateMany({where: {orderId: orderId}, data: {quantity: {decrement: orderQuantity}}});

if (!orderItem) throw new RpcException('Order not found');

const paymentsPayload = {orderItemPrice, companyId, orderId, quantity, status, date: new Date()};
this.notificationService.emit('order-confirmed-notification', paymentsPayload)
this.paymentsService.emit('checkout-payment', paymentsPayload)

return { 
  orderId: payload.orderId, 
  quantity: orderQuantity, 
  totalPaid: orderItemPrice, 
  status: 'CONFIRMED' 
};
}

async getOrder(payload: any) {
const {orderId, userId} = payload
const order = await this.prisma.order.findUnique({where: {id: Number(orderId), companyId: Number(userId)}, include: {items: true}});

if (!order) throw new RpcException('Order not found');

return {
  ...order,
  totalAmount: Number(order.totalAmount),
  items: order.items.map(item => ({
    ...item,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
  })),
}
}
async getOrders (Payload: any) {
const {user_id, dateFilter} = Payload
 const limit = Number(Payload.pagination.limit);
 const page = Number(Payload.pagination.page);

 const whereClause: any = { companyId: user_id };

 if (dateFilter?.startDate || dateFilter?.endDate) {
   whereClause.createdAt = {};
   if (dateFilter.startDate) {
     whereClause.createdAt.gte = new Date(dateFilter.startDate);
   }
   if (dateFilter.endDate) {
     const endDate = new Date(dateFilter.endDate);
     endDate.setHours(23, 59, 59, 999);
     whereClause.createdAt.lte = endDate;
   }
 }

 const query = await this.prisma.order.findMany({
   where: whereClause,
   take: limit,
   skip: (page - 1) * limit,
   orderBy: { createdAt: 'desc' }
 });

return query.map(order => ({
  ...order,
  totalAmount: Number(order.totalAmount),
}))
}

}


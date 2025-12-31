import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreatePaymentDto } from './dto/create-payment.dto';
@Injectable()
export class PaymentsService {
constructor(private prisma: PrismaService, @Inject('NOTIFICATION_SERVICE') private readonly notificationService: ClientProxy) {}
async checkoutPayment(data: CreatePaymentDto) {
try {
const {orderItemPrice, companyId, orderId} = data
const provider = 'MOCK'
const currency = 'DOP'
const status = 'PAID'

await this.prisma.payment.create({data: {amount: orderItemPrice, companyId, orderId, currency: currency, status: status, provider}});
this.notificationService.emit('payment-created-notification', {orderItemPrice, companyId, orderId, currency, status, provider});
return { message: 'Payment created successfully' };

} catch (error) {
    const {orderItemPrice, companyId, orderId} = data

    const provider = 'MOCK'
    const currency = 'DOP'
    const status = 'FAILED'

    await this.prisma.payment.create({data: {amount: Number(orderItemPrice), companyId, orderId, currency: currency, status: status, provider}});
    console.error(error);
    this.notificationService.emit('payment-failed-notification', {orderItemPrice, companyId, orderId, currency, status, provider});
    throw new RpcException({ message: 'Payment failed' });
    }

}
}


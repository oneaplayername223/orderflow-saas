import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreatePaymentDto } from './dto/create-payment.dto';
@Injectable()
export class PaymentsService {
constructor(private prisma: PrismaService, @Inject('NOTIFICATION_SERVICE') private readonly notificationService: ClientProxy,
@Inject('PDF_SERVICE') private readonly pdfService: ClientProxy) {}
async checkoutPayment(data: CreatePaymentDto) {
const provider = 'MOCK'
const currency = 'DOP'

enum Status {
        PAID = 'PAID',
        PENDING = 'PENDING',
        FAILED = 'FAILED',
    }
    
const {orderItemPrice, companyId, orderQuantity, orderId} = data
try {

const {referenceName, description, unitPrice, subtotal} = data.orderItems?.[0] || {}

const payment = await this.prisma.payment.create({data: {amount: orderItemPrice, companyId, orderId, currency, Status: Status.PAID, provider}});
const paymentId = payment.id;
this.notificationService.emit('payment-created-notification', {orderItemPrice, companyId, orderId, currency, status: Status.PAID, provider});
 const pdf = await this.pdfService.send('checkout_pdf', {referenceName, description, orderQuantity, unitPrice, subtotal, orderItemPrice, companyId, orderId, currency, status: Status.PAID, provider, paymentId});

return pdf

} catch (error) {
    

    await this.prisma.payment.create({data: {amount: Number(orderItemPrice), companyId, orderId, currency, Status: Status.FAILED, provider}});
    console.error(error);
    this.notificationService.emit('payment-failed-notification', {orderItemPrice, companyId, orderId, currency, status: Status.FAILED, provider});
    throw new RpcException({ message: 'Payment failed' });
    }

}
}


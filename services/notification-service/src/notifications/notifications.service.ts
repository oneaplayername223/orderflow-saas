import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
    constructor(@Inject('NOTIFICATION_SERVICE') private readonly notificationService: ClientProxy) {}


    async registerNotification(data: any) {
        const { email, username } = data;
        await firstValueFrom(this.notificationService.emit('register-succeeded-mail', data));
        return console.log('Welcome!', username, 'Your account has been created successfully.');
    }

    async loginNotification(data: any) {
        const { email, username } = data;
        await firstValueFrom(this.notificationService.emit('login-succeeded-mail', data));
        return console.log({'email': email, 'username': username, 'message': 'User logged in successfully', 'ip': data.ip});
        
    }

    async loginFailedNotification(data: any) {
        const { email, username } = data;
        return console.log({'email': email, 'username': username, 'message': 'User login failed'});
    }

     async paymentCreated(data: any) {
        return console.log(`
            Payment registered successfully
            Item price: ${data.orderItemPrice + ' ' + data.currency}
            Provider: ${data.provider}
            Order id: ${data.orderId}
            Currency: ${data.currency}
            Status: ${data.status}
            `);
    }

    async paymentFailed(data: any) {
        return console.log(`
            Payment failed
            Item price: ${data.orderItemPrice + ' ' + data.currency}
            Provider: ${data.provider}
            Order id: ${data.orderId}
            Currency: ${data.currency}
            Status: ${data.status}
            Please Contact Support
            `);
    }

    async orderConfirmed(data: any){
         return console.log(`
            Order Confirmed
            Item price: ${data.orderItemPrice + ' ' + data.currency}
            Provider: ${data.provider}
            Order id: ${data.orderId}
            Currency: ${data.currency}
            Status: ${data.status}
            
            `);
    }
}

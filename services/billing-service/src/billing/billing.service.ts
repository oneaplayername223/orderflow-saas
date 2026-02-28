import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GetBillingDto } from './dto/get-billing.dto';

@Injectable()
export class BillingService {

    constructor(@Inject(PrismaClient) private readonly prismaService: PrismaClient) {}


    async createBilling(chargeDto: any) {
    
        const query = this.prismaService.billing.create({
        data: {
                accountId: chargeDto,
                amount: chargeDto.amount || 2000,
                accountType: chargeDto.accountType || 'TRIAL',
                createdAt: new Date(),
                expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
        });
        console.log('Executing createBilling with data:', chargeDto);
        return query;
    }

    async getBilling(accountId: GetBillingDto) {
    
       
        const id = accountId.accountId
        console.log('Executing getBilling for accountId:', id);
        const query = await this.prismaService.billing.findFirst({
            where: {
                accountId: id,
            },
        });
        const currentDate =  query?.createdAt;
        const expireDate = query?.expireAt;
        if (currentDate! >= expireDate!) {
            console.log('Billing expired for accountId:', accountId);
            return false
        }
        return {
            query,
            message: 'Billing is active',
        }
      
        
    }
}

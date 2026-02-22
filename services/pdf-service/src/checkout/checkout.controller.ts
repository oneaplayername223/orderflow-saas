import { Controller, Logger } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { MessagePattern, RpcException } from '@nestjs/microservices';

@Controller()
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(private readonly checkoutService: CheckoutService) {}

  @MessagePattern('checkout_pdf')
  async checkoutPdf(data: any) {
    try {
      this.logger.log(`[checkout_pdf] Recibido mensaje con datos: ${JSON.stringify(data)}`);
      const result = await this.checkoutService.checkoutPdf(data);
      this.logger.log(`[checkout_pdf] PDF generado exitosamente: ${result.fileName}`);
      return result;
    } catch (error) {
      this.logger.error(`[checkout_pdf] Error generando PDF: ${error}`);
      throw new RpcException({ message: 'Error generating PDF', error });
    }
  }

}

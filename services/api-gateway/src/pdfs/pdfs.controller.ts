import { Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('pdfs')
export class PdfsController {
  constructor(@Inject('PDF_SERVICE') private readonly pdfService: ClientProxy) {}

  @Post('generate')
  generatePdf() {
    return this.pdfService.send('checkout_pdf', {}); 
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';

const pdfMake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const FACTURAS_DIR = path.join(process.cwd(), 'facturas');

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(@Inject('AUTH_SERVICE') private readonly authService: ClientProxy) {
    this.initFacturasDirectory();
  }

  private async initFacturasDirectory() {
    try {
      if (!fs.existsSync(FACTURAS_DIR)) {
        await fsPromises.mkdir(FACTURAS_DIR, { recursive: true });
        this.logger.log(`Facturas directory created at: ${FACTURAS_DIR}`);
      } else {
        this.logger.log(`Facturas directory exists at: ${FACTURAS_DIR}`);
      }
    } catch (error) {
      this.logger.error(`Error initializing facturas directory: ${error}`);
    }
  }

  async checkoutPdf(data: any): Promise<{ filePath: string; fileName: string }> {
    try {
      this.logger.log(`Iniciando generación de PDF con datos: ${JSON.stringify(data)}`);

      const {
        referenceName,
        description,
        orderQuantity,
        paymentId,
        unitPrice,
        subtotal,
        orderItemPrice,
        companyId,
        orderId,
        currency,
        status,
        provider,
      } = data;

      // Obtener datos de la compañía desde el auth service
      let company_name = 'Nombre de la Compañía';
      let email = 'N/A';
      let phone = 'N/A';

      try {
        const companyProfile = await firstValueFrom(
          this.authService.send('get-user', companyId),
        );
        if (companyProfile?.query) {
          company_name = companyProfile.query.company_name || company_name;
          email = companyProfile.query.email || email;
          phone = companyProfile.query.phone || phone;
        }
        this.logger.log(`Datos de compañía obtenidos: ${company_name}`);
      } catch (authError) {
        this.logger.warn(`No se pudo obtener datos de auth service, usando valores por defecto: ${authError}`);
      }

      const docDefinition = {
        content: [
          {
            text: company_name,
            style: 'companyHeader',
          },
          {
            text: `RNC/ID: ${companyId}`,
            style: 'companyInfo',
          },
          {
            text: `Teléfono: ${phone} | Email: ${email}`,
            style: 'companyInfo',
            margin: [0, 0, 0, 20],
          },

          // Título de la factura
          { text: `Factura de compra #${paymentId}`, style: 'header' },

          // Tabla de detalle
          {
            table: {
              widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Item', style: 'tableHeader' },
                  { text: 'Cantidad', style: 'tableHeader' },
                  { text: 'Descripción', style: 'tableHeader' },
                  { text: 'Precio Unitario', style: 'tableHeader' },
                  { text: 'Proveedor', style: 'tableHeader' },
                  { text: 'Fecha', style: 'tableHeader' },
                ],
                [
                  referenceName,
                  orderQuantity,
                  description,
                  `${currency} ${unitPrice}`,
                  provider,
                  new Date().toLocaleDateString(),
                ],
                [
                  { text: 'Subtotal', colSpan: 5, alignment: 'right' },
                  {}, {}, {}, {},
                  `${currency} ${subtotal}`,
                ],
                [
                  { text: 'Total', colSpan: 5, alignment: 'right', bold: true },
                  {}, {}, {}, {},
                  { text: `${currency} ${orderItemPrice}`, bold: true },
                ],
              ],
            },
            layout: 'lightHorizontalLines',
          },

          // Estado del pedido
          {
            text: `Estado del pedido: ${status}`,
            style: 'status',
            margin: [0, 20, 0, 0],
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 10, 0, 20] },
          companyHeader: { fontSize: 16, bold: true, alignment: 'left' },
          companyInfo: { fontSize: 10, italics: true, alignment: 'left' },
          tableHeader: { bold: true, fillColor: '#eeeeee', alignment: 'center' },
          status: { fontSize: 12, bold: true, color: '#007BFF' },
        },
        defaultStyle: {
          font: 'Roboto',
        },
      };

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);

      return new Promise<{ filePath: string; fileName: string }>((resolve, reject) => {
        pdfDocGenerator.getBuffer(async (buffer: Buffer) => {
          try {
            const fileName = `factura_${orderId}_${Date.now().toString()}.pdf`;
            const filePath = path.join(FACTURAS_DIR, fileName);

            this.logger.log(`Guardando PDF en: ${filePath}`);

            await fsPromises.writeFile(filePath, buffer);

            this.logger.log(`PDF guardado exitosamente: ${fileName}`);
            resolve({ filePath, fileName });
          } catch (error) {
            this.logger.error(`Error guardando PDF: ${error}`);
            reject(error);
          }
        });
      });
    } catch (error) {
      this.logger.error(`Error en checkoutPdf: ${error}`);
      throw error;
    }
  }
}
import { Decimal } from '@prisma/client/runtime/library';
export type Item = {
  referenceName: string;
  description: string;
  quantity: number;
  unitPrice: Decimal;
  subtotal: Decimal;
};
// src/common/enums/order.enums.ts
export enum OrderStatus {
  CREATED = "CREATED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export enum OrderType {
  SALE = "SALE",
  SERVICE = "SERVICE",
  TASK = "TASK",
}

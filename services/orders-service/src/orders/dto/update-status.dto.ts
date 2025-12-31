import { IsEnum } from "class-validator";

enum OrderStatus {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}
export class updateStatusDto {
    @IsEnum(OrderStatus, {
        message: 'Status must be one of the following: CREATED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELED',
    })
    status: string;
}
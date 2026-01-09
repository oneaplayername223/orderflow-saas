import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { OrdersModule } from './orders.module'; // importa tu módulo real
import { of } from 'rxjs';
import { AuthGuard } from '../guards/auth/auth.guard';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      // Mock del cliente RMQ
      .overrideProvider('ORDERS_SERVICE')
      .useValue({
        send: jest.fn().mockImplementation((pattern: string, payload: any) => {
          if (pattern === 'create-order') {
            return of({ id: 1, status: 'created' });
          }
          if (pattern === 'get-orders') {
            return of([{ id: 1, status: 'created' }]);
          }
          if (pattern === 'get-order') {
            return of({ id: payload.orderId, status: 'created' });
          }
          if (pattern === 'update-order') {
            return of({ id: payload.orderId, status: payload.updateStatusDto.status });
          }
          if (pattern === 'checkout-order') {
            return of({ id: payload.orderId, status: 'confirmed' });
          }
        }),
      })
      // Bypass del AuthGuard
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // activa DTOs
    await app.init();
  });

  const createOrderDto = { user_id: 1, product_id: 1, quantity: 1 };

  it('should create an order with valid payload', async () => {
  const createOrderDto = {
    id: 1,
    type: 'SALE',
    totalAmount: 100.0,
    assignedTo: 3,
    items: [
      {
        referenceName: 'Producto A',
        description: 'Descripción',
        quantity: 200,
        unitPrice: 50.0,
      },
    ],
  };

  const response = await request(app.getHttpServer())
    .post('/orders/create')
    .send(createOrderDto)
    .expect(201);

  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('status', 'created');
});


  it('should get orders and return 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('status', 'created');
  });

  it('should get a single order and return 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders/1')
      .expect(200);

    expect(response.body).toHaveProperty('id', "1");
    expect(response.body).toHaveProperty('status', 'created');
  });

  it('should update an order and return 200', async () => {
    const response = await request(app.getHttpServer())
      .patch('/orders/1')
      .send({ status: 'shipped' })
      .expect(200);

    expect(response.body).toHaveProperty('status', 'shipped');
  });


});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from './auth.module';
import { of } from 'rxjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider('AUTH_SERVICE')
      .useValue({
        send: jest.fn().mockImplementation((pattern: string) => {
          if (pattern === 'login') {
            return of({ token: 'fake-token', message: 'Login successful' });
          }
          if (pattern === 'register') {
            return of({ message: 'User registered successfully' });
          }
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('should return 200 on login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'test', password: 'test' })
      .expect(200);

    expect(response.body).toBeDefined();
  });

  
  it('should return 201 and user data on register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'testsss',
        password: 'password123',
        email: 'test@example.com',
        company_name: 'TestCorp',
      })
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User registered successfully');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersModule } from './users.module'; 
import { of } from 'rxjs';
import { AuthGuard } from '../guards/auth/auth.guard';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider('USERS_SERVICE')
      .useValue({
        send: jest.fn().mockImplementation((pattern: string, payload: any) => {
          if (pattern === 'user-profile') {
            return of({
              company_name: 'TechCorp',
              username: 'testuser',
              email: 'test@example.com',
            });
          }
        }),
      })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('should return user profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/profile')
      .expect(200);

    expect(response.body).toHaveProperty('company_name', 'TechCorp');
    expect(response.body).toHaveProperty('username', 'testuser');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

describe('PDF Service E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('AUTH_SERVICE')
      .useValue({
        send: jest.fn().mockReturnValue({
          toPromise: jest.fn().mockResolvedValue({
            query: {
              company_name: 'E2E Test Company',
            },
          }),
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should have AppModule imported', async () => {
    const module = app.get('CheckoutService');
    expect(module).toBeDefined();
  });
});

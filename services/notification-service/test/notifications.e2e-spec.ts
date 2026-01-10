import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NotificationsModule } from '../src/notifications/notifications.module';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('Notifications Service E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
    })
      .overrideProvider('NOTIFICATION_SERVICE')
      .useValue({
        emit: jest.fn().mockReturnValue(of(true)),
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

  describe('Notifications Flow', () => {
    it('should have notifications controller', () => {
      const notificationsController = app.get('NotificationsController');
      expect(notificationsController).toBeDefined();
    });

    it('should have notifications service', () => {
      const notificationsService = app.get('NotificationsService');
      expect(notificationsService).toBeDefined();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('UsersController (API Gateway)', () => {
  let controller: UsersController;
  let usersService: ClientProxy;

  const mockUsersService = {
    send: jest.fn().mockReturnValue(of({
      company_name: 'TestCorp',
      username: 'testuser',
      email: 'test@example.com',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: 'USERS_SERVICE',
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<ClientProxy>('USERS_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('userProfile', () => {
    it('should call users service with user accountId', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };

      mockUsersService.send.mockReturnValue(of({
        role: 'ADMIN',
        status: 'ACTIVE',
        company_name: 'TestCorp',
        username: 'testuser',
        email: 'test@example.com',
      }));

      const result = controller.userProfile(mockReq);
      await firstValueFrom(result);

      expect(mockUsersService.send).toHaveBeenCalledWith('user-profile', 1);
    });

    it('should return user profile data', async () => {
      const mockReq = { user: { accountId: 2, userId: 10 } };
      const expectedProfile = {
        role: 'USER',
        status: 'ACTIVE',
        company_name: 'UserCorp',
        username: 'john',
        email: 'john@example.com',
      };

      mockUsersService.send.mockReturnValue(of(expectedProfile));

      const result = controller.userProfile(mockReq);
      const resolvedResult = await firstValueFrom(result);

      expect(resolvedResult).toEqual(expectedProfile);
    });

    it('should handle missing user in request', async () => {
      const mockReq = { user: undefined };

      mockUsersService.send.mockReturnValue(of(null));

      const result = controller.userProfile(mockReq);
      await firstValueFrom(result);

      expect(mockUsersService.send).toHaveBeenCalledWith('user-profile', undefined);
    });

    it('should pass correct accountId to service', async () => {
      const testCases = [
        { accountId: 1, userId: 5 },
        { accountId: 99, userId: 50 },
        { accountId: 42, userId: 100 },
      ];

      mockUsersService.send.mockReturnValue(of({ role: 'ADMIN', status: 'ACTIVE' }));

      for (const testUser of testCases) {
        const mockReq = { user: testUser };
        const result = controller.userProfile(mockReq);
        await firstValueFrom(result);
        expect(mockUsersService.send).toHaveBeenCalledWith('user-profile', testUser.accountId);
      }

      expect(mockUsersService.send).toHaveBeenCalledTimes(3);
    });

    it('should handle service errors gracefully', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };

      mockUsersService.send.mockReturnValue(of(null));

      const result = controller.userProfile(mockReq);
      const resolvedResult = await firstValueFrom(result);

      expect(resolvedResult).toBeNull();
    });

    it('should return complete user profile with all fields', async () => {
      const mockReq = { user: { accountId: 1, userId: 5 } };
      const completeProfile = {
        id: 1,
        accountId: 1,
        role: 'ADMIN',
        status: 'ACTIVE',
        company_name: 'AdminCorp',
        username: 'admin',
        email: 'admin@example.com',
        createdAt: new Date(),
      };

      mockUsersService.send.mockReturnValue(of(completeProfile));

      const result = controller.userProfile(mockReq);
      const resolvedResult = await firstValueFrom(result);

      expect(resolvedResult).toEqual(completeProfile);
      expect(resolvedResult).toHaveProperty('role');
      expect(resolvedResult).toHaveProperty('status');
      expect(resolvedResult).toHaveProperty('company_name');
    });
  });
});

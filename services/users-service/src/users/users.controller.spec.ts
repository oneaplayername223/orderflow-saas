import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user via message pattern', async () => {
      const accountId = 1;
      const mockUser = { id: 1, accountId, role: 'ADMIN', status: 'ACTIVE' };
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(accountId);

      expect(result).toEqual(mockUser);
      expect(service.createUser).toHaveBeenCalledWith(accountId);
    });
  });

  describe('getUser', () => {
    it('should get user information', async () => {
      const accountId = 1;
      const mockUserInfo = { role: 'USER', status: 'ACTIVE' };
      mockUsersService.getUser.mockResolvedValue(mockUserInfo);

      const result = await controller.getUser(accountId);

      expect(result).toEqual(mockUserInfo);
      expect(service.getUser).toHaveBeenCalledWith(accountId);
    });
  });

  describe('getUserProfile', () => {
    it('should get complete user profile', async () => {
      const accountId = 1;
      const mockProfile = {
        role: 'ADMIN',
        status: 'ACTIVE',
        company_name: 'TestCorp',
        email: 'test@example.com',
        username: 'testuser',
      };
      mockUsersService.getUserProfile.mockResolvedValue(mockProfile);

      const result = await controller.userProfile(accountId);

      expect(result).toEqual(mockProfile);
      expect(service.getUserProfile).toHaveBeenCalledWith(accountId);
    });

    it('should throw error if profile fetch fails', async () => {
      mockUsersService.getUserProfile.mockRejectedValue(new Error('Profile fetch failed'));

      await expect(controller.userProfile(1)).rejects.toThrow('Profile fetch failed');
    });

    it('should return profile with all user data', async () => {
      const mockProfile = {
        id: 1,
        accountId: 1,
        role: 'USER',
        status: 'ACTIVE',
        company_name: 'UserCorp',
        username: 'john',
        email: 'john@example.com',
      };
      mockUsersService.getUserProfile.mockResolvedValue(mockProfile);

      const result = await controller.userProfile(1);

      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('company_name');
    });
  });
});

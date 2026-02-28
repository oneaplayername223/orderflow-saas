import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { of } from 'rxjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    account: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockNotificationService = {
    emit: jest.fn().mockReturnValue(of(true)),
  };
  const mockBillingService = {
    send: jest.fn().mockReturnValue(of({ success: true })),
    emit: jest.fn().mockReturnValue(of(true)),
  };

  const mockUsersService = {
    send: jest.fn().mockReturnValue(of({ role: 'USER', status: 'ACTIVE' })),
    emit: jest.fn().mockReturnValue(of(true)),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'NOTIFICATION_SERVICE', useValue: mockNotificationService },
        { provide: 'USERS_SERVICE', useValue: mockUsersService },
        { provide: 'BILLING_SERVICE', useValue: mockBillingService },
      ],
    }).compile();


    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should hash password, create account and emit notifications', async () => {
      const dto = { username: 'test', password: '1234', email: 'test@example.com', company_name: 'TestCorp' };
      mockPrisma.account.create.mockResolvedValue({ id: 1, ...dto, password: await bcrypt.hash(dto.password, 10) });

      const result = await service.registerUser(dto);

      expect(mockPrisma.account.create).toHaveBeenCalled();
      expect(mockNotificationService.emit).toHaveBeenCalledWith('register-notification', dto);
      expect(mockUsersService.emit).toHaveBeenCalledWith('create-user', 1);
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should throw error if account creation fails', async () => {
      const dto = { username: 'test', password: '1234', email: 'test@example.com', company_name: 'TestCorp' };
      mockPrisma.account.create.mockRejectedValue(new Error('Database error'));

      await expect(service.registerUser(dto)).rejects.toThrow('Database error');
    });

    it('should emit notifications after successful registration', async () => {
      const dto = { username: 'testuser', password: 'password123', email: 'user@example.com', company_name: 'MyCompany' };
      mockPrisma.account.create.mockResolvedValue({ id: 5, ...dto });

      await service.registerUser(dto);

      expect(mockNotificationService.emit).toHaveBeenCalledWith('register-notification', dto);
      expect(mockUsersService.emit).toHaveBeenCalledWith('create-user', 5);
    });
  });

  describe('loginUser', () => {
    it('should throw RpcException if user not found', async () => {
      mockPrisma.account.findFirst.mockResolvedValue(null);

      await expect(service.loginUser({ username: 'nope', password: '1234', ip: '127.0.0.1' }))
        .rejects.toThrow(RpcException);
    });

    it('should throw RpcException if password invalid', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ id: 1, username: 'test', password: await bcrypt.hash('other', 10), userId: 1 });

      await expect(service.loginUser({ username: 'test', password: 'wrong', ip: '127.0.0.1' }))
        .rejects.toThrow(RpcException);
    });

    it('should return token if login successful', async () => {
      const hashed = await bcrypt.hash('1234', 10);
      mockPrisma.account.findFirst.mockResolvedValue({ id: 1, username: 'test', password: hashed, userId: 99 });
      mockUsersService.send.mockReturnValue(of({ role: 'USER', status: 'ACTIVE' }));

      const result = await service.loginUser({ username: 'test', password: '1234', ip: '127.0.0.1' });

      expect(result).toHaveProperty('message', 'User logged in successfully');
      expect(result).toHaveProperty('token');
      const decoded = jwt.decode(result.token) as any;
      expect(decoded.accountId).toBe(1);
      expect(decoded.role).toBe('USER');
    });

    it('should throw RpcException if user not ACTIVE', async () => {
      const hashed = await bcrypt.hash('1234', 10);
      mockPrisma.account.findFirst.mockResolvedValue({ id: 1, username: 'test', password: hashed, userId: 1 });
      mockUsersService.send.mockReturnValue(of({ role: 'USER', status: 'INACTIVE' }));

      await expect(service.loginUser({ username: 'test', password: '1234', ip: '127.0.0.1' }))
        .rejects.toThrow(RpcException);
    });

    it('should emit login notification after successful login', async () => {
      const hashed = await bcrypt.hash('pass123', 10);
      const accountData = { id: 2, username: 'john', password: hashed, userId: 1, email: 'john@example.com' };
      mockPrisma.account.findFirst.mockResolvedValue(accountData);
      mockUsersService.send.mockReturnValue(of({ role: 'ADMIN', status: 'ACTIVE' }));

      await service.loginUser({ username: 'john', password: 'pass123', ip: '192.168.1.1' });

      expect(mockNotificationService.emit).toHaveBeenCalledWith('login-notification', expect.objectContaining({
        ip: '192.168.1.1'
      }));
    });

    it('should emit login-failed-notification when user is inactive', async () => {
      const hashed = await bcrypt.hash('pass123', 10);
      mockPrisma.account.findFirst.mockResolvedValue({ id: 1, username: 'test', password: hashed, userId: 1 });
      mockUsersService.send.mockReturnValue(of({ role: 'USER', status: 'INACTIVE' }));

      try {
        await service.loginUser({ username: 'test', password: 'pass123', ip: '127.0.0.1' });
      } catch (e) {
        expect(mockNotificationService.emit).toHaveBeenCalledWith('login-failed-notification', expect.any(Object));
      }
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ company_name: 'TestCorp', email: 'test@example.com', username: 'test' });

      const result = await service.getUserProfile(1);

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { company_name: true, email: true, username: true },
      });
      expect(result).toEqual({ query: { company_name: 'TestCorp', email: 'test@example.com', username: 'test' } });
    });
  });
});

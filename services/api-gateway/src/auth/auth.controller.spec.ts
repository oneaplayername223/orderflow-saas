import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('AuthController (API Gateway)', () => {
  let controller: AuthController;
  let authService: ClientProxy;

  const mockAuthService = {
    send: jest.fn().mockReturnValue(of({ message: 'Success', token: 'jwt-token-123' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<ClientProxy>('AUTH_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should call auth service register endpoint', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        company_name: 'TestCorp',
      };

      mockAuthService.send.mockReturnValue(of({ message: 'User registered successfully' }));

      const result = await controller.registerUser(registerDto);

      expect(mockAuthService.send).toHaveBeenCalledWith('register', registerDto);
    });

    it('should pass registerUserDto to auth service', async () => {
      const registerDto = {
        username: 'john',
        email: 'john@example.com',
        password: 'secure123',
        company_name: 'JohnCorp',
      };

      await controller.registerUser(registerDto);

      expect(mockAuthService.send).toHaveBeenCalledWith('register', expect.objectContaining({
        username: 'john',
        email: 'john@example.com',
      }));
    });
  });

  describe('loginUser', () => {
    it('should login user and set cookie', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const mockRes = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      };
      const mockReq = { ip: '127.0.0.1' };

      mockAuthService.send.mockReturnValue(of({
        message: 'User logged in successfully',
        token: 'jwt-token-123',
      }));

      const result = await controller.loginUser(mockRes, loginDto, mockReq);

      expect(mockAuthService.send).toHaveBeenCalledWith('login', expect.objectContaining({
        username: 'testuser',
        password: 'password123',
        ip: '127.0.0.1',
      }));
      expect(mockRes.cookie).toHaveBeenCalledWith('flowToken', 'jwt-token-123', { httpOnly: true });
    });

    it('should include IP address in login request', async () => {
      const loginDto = { username: 'user', password: 'pass' };
      const mockRes = { cookie: jest.fn() };
      const mockReq = { ip: '192.168.1.100' };

      mockAuthService.send.mockReturnValue(of({ message: 'Success', token: 'token-456' }));

      await controller.loginUser(mockRes, loginDto, mockReq);

      expect(mockAuthService.send).toHaveBeenCalledWith('login', expect.objectContaining({
        ip: '192.168.1.100',
      }));
    });

    it('should set httpOnly cookie with token', async () => {
      const loginDto = { username: 'test', password: 'test123' };
      const mockRes = { cookie: jest.fn() };
      const mockReq = { ip: '127.0.0.1' };

      mockAuthService.send.mockReturnValue(of({
        message: 'Success',
        token: 'my-jwt-token',
      }));

      await controller.loginUser(mockRes, loginDto, mockReq);

      expect(mockRes.cookie).toHaveBeenCalledWith('flowToken', 'my-jwt-token', {
        httpOnly: true,
      });
    });

    it('should return success message as JSON string', async () => {
      const loginDto = { username: 'test', password: 'test' };
      const mockRes = { cookie: jest.fn() };
      const mockReq = { ip: '127.0.0.1' };

      mockAuthService.send.mockReturnValue(of({
        message: 'User logged in successfully',
        token: 'token-123',
      }));

      const result = await controller.loginUser(mockRes, loginDto, mockReq);

      expect(typeof result).toBe('string');
      expect(result).toContain('User logged in successfully');
    });
  });

  describe('logoutUser', () => {
    it('should clear flowToken cookie on logout', async () => {
      const mockRes = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      };

      const result = await controller.logoutUser(mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('flowToken');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should return logout success message', async () => {
      const mockRes = { clearCookie: jest.fn() };

      const result = await controller.logoutUser(mockRes);

      expect(result.message).toBe('Logged out successfully');
    });

    it('should not call auth service on logout', async () => {
      const mockRes = { clearCookie: jest.fn() };

      await controller.logoutUser(mockRes);

      expect(mockAuthService.send).not.toHaveBeenCalled();
    });
  });
});

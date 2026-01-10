import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerUser: jest.fn(),
            loginUser: jest.fn(),
            getUserProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const mockUser = { username: 'juanito', email: "juanito@example.com", password: "password123", company_name: "TechCorp" };
      (authService.registerUser as jest.Mock).mockResolvedValue({ message: 'User registered successfully' });

      const result = await authController.registerUser(mockUser);
      expect(result).toEqual({ message: 'User registered successfully' });
      expect(authService.registerUser).toHaveBeenCalledWith(mockUser);
    });

    it('should throw an error if registration fails', async () => {
      const mockUser = { username: 'juanito', email: "juanito@example.com", password: "password123", company_name: "TechCorp" };
      (authService.registerUser as jest.Mock).mockRejectedValue(new Error('Registration failed'));

      await expect(authController.registerUser(mockUser)).rejects.toThrow('Registration failed');
    });

    it('should validate required fields in registration', async () => {
      const invalidUser = { username: 'juanito', email: "juanito@example.com" };
      (authService.registerUser as jest.Mock).mockRejectedValue(new Error('Missing required fields'));

      await expect(authController.registerUser(invalidUser as any)).rejects.toThrow('Missing required fields');
    });
  });

  describe('loginUser', () => {
    it('should login a user and return token', async () => {
      const loginDto = { username: 'juanito', password: 'password123', ip: '127.0.0.1' };
      const mockResponse = { message: 'User logged in successfully', token: 'jwt-token-123' };
      (authService.loginUser as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authController.loginUser(loginDto);
      expect(result).toEqual(mockResponse);
      expect(authService.loginUser).toHaveBeenCalledWith(loginDto);
    });

    it('should throw error on invalid credentials', async () => {
      const loginDto = { username: 'juanito', password: 'wrongpassword', ip: '127.0.0.1' };
      (authService.loginUser as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      await expect(authController.loginUser(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not found', async () => {
      const loginDto = { username: 'nonexistent', password: 'password123', ip: '127.0.0.1' };
      (authService.loginUser as jest.Mock).mockRejectedValue(new Error('User not found'));

      await expect(authController.loginUser(loginDto)).rejects.toThrow('User not found');
    });
  });

  describe('userProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = { query: { username: 'juanito', email: 'juanito@example.com', company_name: 'TechCorp' } };
      (authService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

      const result = await authController.userProfile(1);
      expect(result).toEqual(mockProfile);
      expect(authService.getUserProfile).toHaveBeenCalledWith(1);
    });

    it('should throw error if profile not found', async () => {
      (authService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Profile not found'));

      await expect(authController.userProfile(999)).rejects.toThrow('Profile not found');
    });
  });
});

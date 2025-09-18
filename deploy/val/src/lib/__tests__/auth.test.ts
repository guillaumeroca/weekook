import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth';
import { dbUtils } from '../database';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('../database', () => ({
  dbUtils: {
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    verifyUser: vi.fn(),
    makeUserKooker: vi.fn(),
    createKookerProfile: vi.fn(),
    updateUser: vi.fn(),
    updateKookerProfile: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        isKooker: false,
        isVerified: true,
      };

      vi.mocked(dbUtils.getUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true);

      const result = await AuthService.authenticateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isKooker: false,
        isVerified: true,
      });
    });

    it('should return null when user does not exist', async () => {
      vi.mocked(dbUtils.getUserByEmail).mockResolvedValue(null);

      const result = await AuthService.authenticateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        isKooker: false,
        isVerified: true,
      };

      vi.mocked(dbUtils.getUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false);

      const result = await AuthService.authenticateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: null,
        lastName: null,
        isKooker: false,
        isVerified: false,
      };

      vi.mocked(dbUtils.getUserByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword');
      vi.mocked(dbUtils.createUser).mockResolvedValue(mockUser);

      const result = await AuthService.createUser('test@example.com', 'password');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: undefined,
        lastName: undefined,
        isKooker: false,
        isVerified: false,
      });
    });

    it('should throw error when user already exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: null,
        lastName: null,
        isKooker: false,
        isVerified: false,
      };

      vi.mocked(dbUtils.getUserByEmail).mockResolvedValue(mockUser);

      await expect(
        AuthService.createUser('test@example.com', 'password')
      ).rejects.toThrow('Un compte avec cet email existe déjà');
    });
  });
});
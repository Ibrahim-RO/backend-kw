import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  const userRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uses page and limit to calculate the database offset', async () => {
    const users = [{ user_id: 21 }];
    userRepository.findAndCount.mockResolvedValue([users, 25]);

    await expect(service.findAll({ page: 3, limit: 10 })).resolves.toEqual({
      data: users,
      meta: {
        total: 25,
        page: 3,
        limit: 10,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });

    expect(userRepository.findAndCount).toHaveBeenCalledWith({
      take: 10,
      skip: 20,
      where: { status: true },
      order: { user_id: 'ASC' },
    });
  });

  it('uses the first page and ten records by default', async () => {
    userRepository.findAndCount.mockResolvedValue([[], 11]);

    const result = await service.findAll({} as never);

    expect(userRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 0 }),
    );
    expect(result.meta).toEqual(
      expect.objectContaining({ page: 1, limit: 10, totalPages: 2 }),
    );
  });

  it('returns the user without password and a JWT for valid credentials', async () => {
    const password = await bcrypt.hash('secret123', 10);
    userRepository.findOne.mockResolvedValue({
      user_id: 7,
      name: 'Ana',
      email: 'ana@example.com',
      password,
      status: true,
    });
    jwtService.sign.mockReturnValue('signed.jwt');

    await expect(
      service.login({ email: ' ANA@EXAMPLE.COM ', password: 'secret123' }),
    ).resolves.toEqual({
      success: true,
      data: {
        user_id: 7,
        name: 'Ana',
        email: 'ana@example.com',
        status: true,
      },
      token: 'signed.jwt',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({ id: 7 });
  });

  it('rejects invalid credentials without revealing which field failed', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});

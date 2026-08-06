import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/pagination/pagination.dto';
import { paginate } from '../common/pagination/paginate';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  private readonly logger = new Logger('UserService');

  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) { }

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const user = this.userRepository.create({
      ...userData,
      password: await bcrypt.hash(password, 10)
    })

    try {
      const createdUser = await this.userRepository.save(user);
      const { password: _, ...safeUser } = createdUser;

      return {
        success: true,
        data: safeUser
      }

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    return paginate(this.userRepository, paginationDto, {
      where: {
        status: true
      },
      order: {
        user_id: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ user_id: id, status: true });

    if (!user)
      throw new NotFoundException(`Usuario con id: ${id} no encontrado`);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    const { password, ...userData } = updateUserDto;

    Object.assign(user, userData);

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    try {
      const updatedUser = await this.userRepository.save(user);
      const { password: _, ...safeUser } = updatedUser;

      return {
        success: true,
        data: safeUser
      }

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async remove(id: number) {
    const user = await this.findOne(id);
    user.status = false;

    try {
      await this.userRepository.save(user);

      return {
        success: true,
        message: 'Usuario eliminado correctamente',
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error,check server logs');
  }

}

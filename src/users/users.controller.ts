import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../common/pagination/pagination.dto';
import { LoginDto } from './dto/login.dto';
import { Profiles } from './decorators/profiles.decorator';
import { UserProfile } from './enums/user-profile.enum';
import { ProfilesGuard } from './guards/profiles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(ProfilesGuard)
  @Profiles(UserProfile.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('me')
  @UseGuards(ProfilesGuard)
  getMe(@CurrentUser() user: User) {
    const { password, ...safeUser } = user;
    return { success: true, data: safeUser };
  }

  @Patch('me')
  @UseGuards(ProfilesGuard)
  updateMe(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.user_id, updateProfileDto);
  }

  @Get(':id')
  @UseGuards(ProfilesGuard)
  @Profiles(UserProfile.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ProfilesGuard)
  @Profiles(UserProfile.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(ProfilesGuard)
  @Profiles(UserProfile.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }
}

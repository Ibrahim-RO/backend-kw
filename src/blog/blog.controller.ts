import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PaginationDto } from '../common/pagination/pagination.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { Profiles } from '../users/decorators/profiles.decorator';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/enums/user-profile.enum';
import { ProfilesGuard } from '../users/guards/profiles.guard';

@Controller('blog')
@UseGuards(ProfilesGuard)
@Profiles(UserProfile.ADMIN)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @CurrentUser() user: User) {
    return this.blogService.create(createBlogDto, user.user_id);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.blogService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }
}

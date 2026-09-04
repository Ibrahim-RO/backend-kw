import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
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
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  findPublished(@Query() paginationDto: PaginationDto) {
    return this.blogService.findPublished(paginationDto);
  }

  @Get(':slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.blogService.findPublishedBySlug(slug);
  }
}

@Controller('admin/blog')
@UseGuards(ProfilesGuard)
@Profiles(UserProfile.ADMIN)
export class AdminBlogController {
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

  @Post('images')
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)),
  }))
  async uploadImage(@UploadedFile() file: any, @Req() request: Request) {
    if (!file) throw new BadRequestException('Selecciona una imagen JPG, PNG, WebP o GIF de máximo 8 MB');
    const extensions: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
    const extension = extensions[file.mimetype] ?? extname(file.originalname).toLowerCase();
    const directory = join(process.cwd(), 'uploads', 'blog');
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(join(directory, filename), file.buffer);
    const forwardedProto = request.header('x-forwarded-proto');
    const protocol = forwardedProto?.split(',')[0] ?? request.protocol;
    return { url: `${protocol}://${request.get('host')}/uploads/blog/${filename}`, filename };
  }
}

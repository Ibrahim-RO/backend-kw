import { BadRequestException, Body, Controller, Get, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { HomepageService } from './homepage.service';
import { UpdateHomepageDto } from './dto/update-homepage.dto';
import { ProfilesGuard } from '../users/guards/profiles.guard';
import { Profiles } from '../users/decorators/profiles.decorator';
import { UserProfile } from '../users/enums/user-profile.enum';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly service: HomepageService) {}
  @Get() published() { return this.service.getPublished(); }
}

@Controller('admin/homepage')
@UseGuards(ProfilesGuard)
@Profiles(UserProfile.ADMIN)
export class AdminHomepageController {
  constructor(private readonly service: HomepageService) {}
  @Get() get() { return this.service.getAdmin(); }
  @Patch() update(@Body() dto: UpdateHomepageDto) { return this.service.updateDraft(dto); }
  @Post('publish') publish(@Body() dto: UpdateHomepageDto) { return this.service.publish(dto); }

  @Post('images')
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)),
  }))
  async uploadImage(@UploadedFile() file: any, @Req() request: Request) {
    if (!file) throw new BadRequestException('Selecciona una imagen JPG, PNG, WebP o GIF de máximo 8 MB');
    const extensions: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
    const extension = extensions[file.mimetype] ?? extname(file.originalname).toLowerCase();
    const directory = join(process.cwd(), 'uploads', 'homepage');
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(join(directory, filename), file.buffer);
    const forwardedProto = request.header('x-forwarded-proto');
    const protocol = forwardedProto?.split(',')[0] ?? request.protocol;
    return { url: `${protocol}://${request.get('host')}/uploads/homepage/${filename}`, filename };
  }
}

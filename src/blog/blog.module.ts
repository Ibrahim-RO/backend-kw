import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogPost } from './entities/blog-post.entity';
import { BlogAttachment } from './entities/blog-attachment.entity';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  imports: [
    TypeOrmModule.forFeature([BlogPost, BlogAttachment]),
    UsersModule,
  ],
})
export class BlogModule {}

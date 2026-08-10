import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateBlogDto } from './create-blog.dto';
import { BlogStatus } from '../enums/blog-status.enum';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsEnum(BlogStatus, {
    message: `El estado debe ser uno de los siguientes valores: ${Object.values(BlogStatus).join(', ')}`,
  })
  @IsOptional()
  status?: BlogStatus;
}

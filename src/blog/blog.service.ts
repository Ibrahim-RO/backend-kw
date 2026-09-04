import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Not, Repository } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PaginationDto } from '../common/pagination/pagination.dto';
import { paginate } from '../common/pagination/paginate';
import { BlogStatus } from './enums/blog-status.enum';
import { User } from '../users/entities/user.entity';
import { slugify } from './utils/slugify';

@Injectable()
export class BlogService {
  private readonly logger = new Logger('BlogService');

  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepository: Repository<BlogPost>,
  ) {}

  async create(createBlogDto: CreateBlogDto, authorId: number) {
    const { published_at, slug, ...rest } = createBlogDto;

    const post = this.blogRepository.create({
      ...rest,
      slug: await this.buildUniqueSlug(slug ?? createBlogDto.title),
      published_at: new Date(published_at),
      author: { user_id: authorId } as User,
    });

    try {
      const created = await this.blogRepository.save(post);
      return { success: true, data: created };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    return paginate(this.blogRepository, paginationDto, {
      where: { status: Not(BlogStatus.DELETED) },
      order: { created_at: 'DESC' },
      relations: { author: true },
    });
  }

  async findPublished(paginationDto: PaginationDto) {
    return paginate(this.blogRepository, paginationDto, {
      where: {
        status: BlogStatus.PUBLISHED,
        published_at: LessThanOrEqual(new Date()),
      },
      order: { published_at: 'DESC' },
      relations: { author: true },
    });
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.blogRepository.findOne({
      where: {
        slug,
        status: BlogStatus.PUBLISHED,
        published_at: LessThanOrEqual(new Date()),
      },
      relations: { author: true, attachments: true },
    });

    if (!post)
      throw new NotFoundException(`Entrada de blog no encontrada`);

    return post;
  }

  async findOne(id: number) {
    const post = await this.blogRepository.findOne({
      where: { blog_id: id, status: Not(BlogStatus.DELETED) },
      relations: { author: true, attachments: true },
    });

    if (!post)
      throw new NotFoundException(`Blog con id: ${id} no encontrado`);

    return post;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    const post = await this.findOne(id);
    const { published_at, slug, ...rest } = updateBlogDto;

    Object.assign(post, rest);

    if (slug && slug !== post.slug) {
      post.slug = await this.buildUniqueSlug(slug, id);
    }

    if (published_at) {
      post.published_at = new Date(published_at);
    }

    try {
      const updated = await this.blogRepository.save(post);
      return { success: true, data: updated };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    post.status = BlogStatus.DELETED;

    try {
      await this.blogRepository.save(post);

      return {
        success: true,
        message: 'Blog eliminado correctamente',
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private async buildUniqueSlug(
    source: string,
    ignoreId?: number,
  ): Promise<string> {
    const base = slugify(source);
    let candidate = base;
    let suffix = 2;

    while (
      await this.blogRepository.existsBy(
        ignoreId
          ? { slug: candidate, blog_id: Not(ignoreId) }
          : { slug: candidate },
      )
    ) {
      candidate = `${base}-${suffix}`;
      suffix++;
    }

    return candidate;
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error,check server logs',
    );
  }
}

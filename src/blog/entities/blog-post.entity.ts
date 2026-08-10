import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BlogStatus } from '../enums/blog-status.enum';
import { BlogAttachment } from './blog-attachment.entity';

@Entity({ name: 'blog_posts' })
export class BlogPost {
  @PrimaryGeneratedColumn()
  blog_id!: number;

  @Column('text')
  title!: string;

  @Column('text', { unique: true })
  slug!: string;

  @Column({ type: 'timestamp' })
  published_at!: Date;

  @Column('text')
  content!: string;

  @Column('text', { nullable: true, default: '' })
  featured_image_url?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column('text', { nullable: true })
  extra_authors?: string | null;

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status!: BlogStatus;

  @OneToMany(() => BlogAttachment, (attachment) => attachment.blogPost)
  attachments!: BlogAttachment[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogAttachmentType } from '../enums/blog-attachment-type.enum';
import { BlogPost } from './blog-post.entity';

@Entity({ name: 'blog_attachments' })
export class BlogAttachment {
  @PrimaryGeneratedColumn()
  attachment_id!: number;

  @ManyToOne(() => BlogPost, (blogPost) => blogPost.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'blog_id' })
  blogPost!: BlogPost;

  @Column({
    type: 'enum',
    enum: BlogAttachmentType,
  })
  type!: BlogAttachmentType;

  @Column('text')
  url!: string;

  @Column('text', { nullable: true, default: '' })
  name?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from '../enums/user-profile.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column('text')
  name!: string;

  @Column('text')
  last_name!: string;

  @Column('text')
  surname_name!: string;

  @Column('text', {
    unique: true,
  })
  email!: string;

  @Column('text', {
    select: false,
  })
  password!: string;

  @Column('text')
  phone!: string;

  @Column('text', {
    nullable: true,
    default: '',
  })
  avatar_url?: string;

  @Column('boolean', {
    default: true,
  })
  status!: boolean;

  @Column({
    type: 'enum',
    enum: UserProfile,
    default: UserProfile.MARKETING,
  })
  profile!: UserProfile;

  // Solo aplica cuando `profile` es MARKETING — qué módulos del panel puede
  // ver/usar (ver ModuleKey + ProfilesGuard/@RequireModule). ADMIN siempre
  // tiene acceso a todo sin importar este campo.
  @Column('text', { array: true, nullable: true, default: '{}' })
  modules!: string[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}

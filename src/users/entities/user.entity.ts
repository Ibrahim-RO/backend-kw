import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn()
    user_id!: number;

    @Column('text')
    name!: string

    @Column('text')
    last_name!: string

    @Column('text')
    surname_name!: string

    @Column('text', {
        unique: true
    })
    email!: string

    @Column('text', {
        select: false
    })
    password!: string

    @Column('text')
    phone!: string

    @Column('text', {
        nullable: true,
        default: ''
    })
    avatar_url?: string
    
    @Column('boolean', {
        default: true
    })
    status!: boolean

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date


}

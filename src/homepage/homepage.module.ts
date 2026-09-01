import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { HomepageSettings } from './entities/homepage-settings.entity';
import { HomepageService } from './homepage.service';
import { AdminHomepageController, HomepageController } from './homepage.controller';

@Module({ imports: [TypeOrmModule.forFeature([HomepageSettings]), UsersModule], providers: [HomepageService], controllers: [HomepageController, AdminHomepageController] })
export class HomepageModule {}

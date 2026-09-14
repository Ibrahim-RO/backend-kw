import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { BlogModule } from './blog/blog.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { HomepageModule } from './homepage/homepage.module';
import { databaseOptions } from './database/database.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseOptions,
    }),
    UsersModule,
    BlogModule,
    CommonModule,
    HomepageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfilesGuard } from './guards/profiles.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ProfilesGuard],
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '2h',
        },
      }),
    }),
  ],
  exports: [UsersService, TypeOrmModule, JwtModule, ProfilesGuard],
})
export class UsersModule {}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { PROFILES_KEY } from '../decorators/profiles.decorator';
import { User } from '../entities/user.entity';
import { UserProfile } from '../enums/user-profile.enum';
import { JWTPayload } from '../interfaces/jwt-payload.interface';

export type AuthenticatedRequest = Request & { user: User };

@Injectable()
export class ProfilesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de acceso no proporcionado');
    }

    let payload: JWTPayload;

    try {
      payload = await this.jwtService.verifyAsync<JWTPayload>(token);
    } catch {
      throw new UnauthorizedException('Token de acceso inválido o expirado');
    }

    const user = await this.userRepository.findOneBy({
      user_id: payload.id,
      status: true,
    });

    if (!user) {
      throw new UnauthorizedException('El usuario del token no está activo');
    }

    request.user = user;

    const allowedProfiles = this.reflector.getAllAndOverride<UserProfile[]>(
      PROFILES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowedProfiles?.length && !allowedProfiles.includes(user.profile)) {
      throw new ForbiddenException(
        'No tienes el perfil requerido para acceder a este recurso',
      );
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}

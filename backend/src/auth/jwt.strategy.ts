import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Login } from '../entities/login.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Login)
    private loginRepository: Repository<Login>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.loginRepository.findOne({
      where: { loginId: payload.sub },
    });

    if (!user) throw new UnauthorizedException();

    return {
      loginId: user.loginId,
      email: user.email,
      role: user.role,
      adminId: user.adminId,
      doctorId: user.doctorId,
      patientId: user.patientId,
    };
  }
}

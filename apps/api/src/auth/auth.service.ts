import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName,
      },
    });
    const token = await this.signToken(user.id, user.email);
    return { accessToken: token, user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const token = await this.signToken(user.id, user.email);
    return { accessToken: token, user: this.sanitizeUser(user) };
  }

  private async signToken(userId: string, email: string) {
    return this.jwtService.signAsync({ sub: userId, email });
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    displayName: string;
    xpTotal: number;
    level: number;
    gems: number;
    currentStreak: number;
    longestStreak: number;
  }) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      xpTotal: user.xpTotal,
      level: user.level,
      gems: user.gems,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    };
  }
}

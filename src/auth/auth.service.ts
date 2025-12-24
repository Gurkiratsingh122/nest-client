// auth/auth.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/users/user.service';
import { LoginDto } from './dto/login.dto';
import { permission } from 'process';

interface AuthResponse {
  accessToken: string;
  user: {
    _id: string;
    email: string;
    name: string;
    permissions: string[];
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const { accessToken } = this.generateToken(user);

    const refreshToken = this.jwtService.sign(
      { sub: user._id },
      { expiresIn: '7d' },
    );

    const hash = await bcrypt.hash(refreshToken, 10);

    await this.userService.updateRefreshToken(user._id.toString(), hash);

    return {
      accessToken: accessToken,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        permissions: user.permissions,
        role: user.role,
      },
    };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      permissions: user.permissions,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.getUserById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access denied');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isValid) {
      throw new ForbiddenException('Refresh token mismatch');
    }

    // 🔁 ROTATE TOKENS
    const { accessToken } = this.generateToken(user);
    const newRefreshToken = this.createRefreshToken(user._id.toString());

    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await this.userService.updateRefreshToken(user._id.toString(), newHash);

    return {
      accessToken,
      refreshToken: newRefreshToken, // send via cookie ideally
    };
  }

  async logout(userId: string) {
    await this.userService.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  private createRefreshToken(userId: string) {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '15m' });
  }
}

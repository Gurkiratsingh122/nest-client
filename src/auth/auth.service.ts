// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/users/user.service';
import { LoginDto } from './dto/login.dto';

interface AuthResponse {
  accessToken: string;
  user: {
    _id: string;
    email: string;
    name: string;
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
      throw new UnauthorizedException('Email already registered');
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

    return {
      accessToken: this.jwtService.sign({
        sub: user._id,
        email: user.email,
      }),
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    };
  }

  private generateToken(user: any) {
    const payload = { sub: user._id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}

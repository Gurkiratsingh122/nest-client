import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiOperation({ summary: 'Create a new user' })
  register(@Body() dto: RegisterDto) {
    if (dto.password.length < 6) {
      throw new BadRequestException('Password must be atleast 6 chars long');
    }
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto): Promise<{
    accessToken: string;
    user: { _id: string; email: string; name: string };
  }> {
    if (dto.password.length < 6) {
      throw new BadRequestException('Password must be atleast 6 chars long');
    }
    return this.authService.login(dto);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiOperation({ summary: 'Create a new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto): Promise<{
    accessToken: string;
    user: { _id: string; email: string; name: string };
  }> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiBearerAuth('access-token')
  refresh(@Req() req) {
    return this.authService.refresh(req);
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req) {
    return this.authService.logout(req.user.userId);
  }
}

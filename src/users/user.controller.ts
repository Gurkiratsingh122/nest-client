import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwit-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/enums/permissions.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  // GET /users
  @UseInterceptors(ResponseInterceptor)
  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.CREATE_USER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all users' })
  getUsers() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.CREATE_USER)
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create a new user' })
  createUser(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  // GET /users/1
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.CREATE_USER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id') id: string) {
    return plainToInstance(UserResponseDto, this.usersService.getUserById(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.UPDATE_USER)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: UpdateUserDto })
  updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return this.usersService.updateUser(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.DELETE_USER)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}

// dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Gurkirat Singh',
    description: 'Full name of the user',
  })
  @IsString()
  password: string;

  @IsString()
  name: string;

  @ApiProperty({
    example: 'gurkirat@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}

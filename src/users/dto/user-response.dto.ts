import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose({ name: 'id' })
  _id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: string;

  @Expose()
  permissions: string[];

  @Exclude()
  password: string;

  @Exclude()
  refreshTokenHash: string;

  @Exclude()
  __v: number;
}

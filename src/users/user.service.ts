import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  create(user: CreateUserDto) {
    const adminPermissions = [
      'create:user',
      'update:user',
      'delete:user',
      'read:post',
    ];

    // const editorPermissions = ['update:post', 'read:post'];
    const role = 'admin';
    return this.userModel.create({
      ...user,
      permissions: adminPermissions,
      role: role,
    });
  }

  findAll() {
    return this.userModel.find();
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateData: UpdateUserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async updateRefreshToken(id: string, hash: string) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { refreshTokenHash: hash },
      {
        new: false,
      },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async deleteUser(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async clearRefreshToken(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      refreshTokenHash: null,
    });
  }
}

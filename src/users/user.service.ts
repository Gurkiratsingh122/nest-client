import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  create(user: CreateUserDto) {
    // const adminPermissions = [
    //   'create:user',
    //   'update:user',
    //   'delete:user',
    //   'read:post',
    // ];

    // const editorPermissions = ['update:post', 'read:post'];
    // const role = 'admin';
    return this.userModel.create({
      ...user,
      // permissions: adminPermissions,
      // role: role,
    });
  }

  async findAll(query: PaginationDto & { role?: string }) {
    const { page = 1, limit = 10, search, role } = query;

    const filter: any = {};

    // ✅ TEXT SEARCH (uses index)
    if (search) {
      filter.$text = { $search: search };
    }

    // ✅ ROLE FILTER (uses compound index)
    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 }) // important for index usage
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      page,
      limit,
      total,
      data,
    };
  }

  async findAllUsingCursor(
    query: PaginationDto & { role?: string; cursor?: string },
  ) {
    const { limit = 10, search, role, cursor } = query;

    const filter: any = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (role) {
      filter.role = role;
    }

    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }

    const data = await this.userModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      nextCursor: data.length ? data[data.length - 1].createdAt : null,
      data,
    };
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

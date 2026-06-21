import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { validateEntity } from '../utils/validators';
import { logger } from '../utils/logger';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUser(userData: Partial<User>, createdBy?: string): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      createdBy,
      version: 1,
      status: 'active',
    });

    const validationErrors = await validateEntity(user);
    if (validationErrors) {
      throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
    }

    const existingEmail = await this.userRepository.findOne({ where: { email: userData.email } });
    if (existingEmail) throw new Error('Email already exists');

    const existingAadhaar = await this.userRepository.findOne({ where: { aadhaar: userData.aadhaar } });
    if (existingAadhaar) throw new Error('Aadhaar number already exists');

    const existingPAN = await this.userRepository.findOne({ where: { pan: userData.pan } });
    if (existingPAN) throw new Error('PAN already exists');

    const savedUser = await this.userRepository.save(user);
    logger.info(`User created: ${savedUser.id}`);
    return savedUser;
  }

  async updateUser(id: string, userData: Partial<User>, updatedBy?: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) throw new Error('User not found');

    if (userData.email && userData.email !== existingUser.email) {
      const duplicateEmail = await this.userRepository.findOne({ where: { email: userData.email } });
      if (duplicateEmail && duplicateEmail.id !== id) {
        throw new Error('Email already exists');
      }
    }

    if (userData.aadhaar && userData.aadhaar !== existingUser.aadhaar) {
      const duplicateAadhaar = await this.userRepository.findOne({ where: { aadhaar: userData.aadhaar } });
      if (duplicateAadhaar && duplicateAadhaar.id !== id) {
        throw new Error('Aadhaar number already exists');
      }
    }

    if (userData.pan && userData.pan !== existingUser.pan) {
      const duplicatePAN = await this.userRepository.findOne({ where: { pan: userData.pan } });
      if (duplicatePAN && duplicatePAN.id !== id) {
        throw new Error('PAN already exists');
      }
    }

    const updatedUser = this.userRepository.merge(existingUser, {
      ...userData,
      updatedBy,
      version: existingUser.version + 1,
    });

    const validationErrors = await validateEntity(updatedUser);
    if (validationErrors) {
      throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
    }

    const savedUser = await this.userRepository.save(updatedUser);
    logger.info(`User updated: ${id}`);
    return savedUser;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    return user;
  }

  async getAllUsers(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC', search } = params;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User>[] = [];
    if (search) {
      where.push(
        { name: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
        { primaryMobile: Like(`%${search}%`) }
      );
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      skip,
      take: limit,
      order: { [sortBy]: order },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    await this.userRepository.softDelete(id);
    logger.info(`User deleted: ${id}`);
  }

  async restoreUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, withDeleted: true });
    if (!user) throw new Error('User not found');
    if (!user.deletedAt) throw new Error('User is not deleted');

    await this.userRepository.restore(id);
    logger.info(`User restored: ${id}`);

    const restoredUser = await this.userRepository.findOne({ where: { id } });
    return restoredUser!;
  }

  async getUserStats() {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { status: 'active' } });
    const inactive = await this.userRepository.count({ where: { status: 'inactive' } });
    const suspended = await this.userRepository.count({ where: { status: 'suspended' } });
    const allIncludingDeleted = await this.userRepository.count({ withDeleted: true });

    return {
      total,
      active,
      inactive,
      suspended,
      deleted: allIncludingDeleted - total,
    };
  }
}

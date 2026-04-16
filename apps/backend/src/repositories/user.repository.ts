import { BaseRepository } from './base.repository.js';
import { UserRole } from '@csirs/shared/types';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

class UserRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string) {
    return this.model.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,           // needed only for login verification
        createdAt: true,
      },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return this.model.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async verifyPassword(userPassword: string, inputPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, userPassword);
  }

  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return this.model.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

       async findAllAdmins() {
       return this.model.findMany({
         where: { role: 'ADMIN' },
         select: { id: true, email: true, name: true },
       });
     }
}

export const userRepository = new UserRepository();
export default userRepository;
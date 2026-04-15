import prisma from '../config/prisma.js';
//import type { Prisma } from '@prisma/client';

export abstract class BaseRepository<T = any> {
  protected prisma = prisma;
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  async findById(id: string) {
    return this.model.findUnique({ where: { id } });
  }

  async findMany(options: any = {}) {
    return this.model.findMany(options);
  }

  async create(data: any) {
    return this.model.create({ data });
  }

  async update(id: string, data: any) {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.model.delete({ where: { id } });
  }

  async count(where: any = {}) {
    return this.model.count({ where });
  }
}
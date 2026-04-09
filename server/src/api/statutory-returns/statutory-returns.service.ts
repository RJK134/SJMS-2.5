import prisma from '../../utils/prisma';
import { buildPaginatedResponse } from '../../utils/pagination';

export async function list(query: Record<string, any>) {
  const { page, limit, sort, order, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    ...(filters.academicYear ? { academicYear: filters.academicYear } : {}),
    ...(filters.returnType ? { returnType: filters.returnType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.statutoryReturn.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.statutoryReturn.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

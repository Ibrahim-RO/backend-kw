import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';
import { PaginationDto } from './pagination.dto';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

type PaginationOptions<T extends ObjectLiteral> = Omit<
  FindManyOptions<T>,
  'skip' | 'take'
>;

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  pagination: PaginationDto,
  options: PaginationOptions<T> = {},
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: limit,
  });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

import { Injectable, Inject } from '@nestjs/common';
import { RedisRepository } from '../domain/repository/redis.repository';

@Injectable()
export class CacheService {
    constructor(
        @Inject('REDIS') private readonly redisRepository: RedisRepository,
    ) { }

    async setCache(key: string, value: string, ttl?: number) {
        await this.redisRepository.set(key, value, ttl);
    }

    async getCache(key: string): Promise<string | null> {
        return this.redisRepository.get(key);
    }

    async deleteCache(key: string): Promise<void> {
        await this.redisRepository.delete(key);
    }
}
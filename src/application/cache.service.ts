import { Injectable, Inject } from '@nestjs/common';
import { RedisRepository } from '../domain/repository/redis.repository';
import { RedisService } from '../infrastructure/redis/redis.service';
import { Club } from 'src/domain/model/club';

@Injectable()
export class CacheService {
    constructor(
        //private readonly redisRepository: RedisService,
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
import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { RedisRepository } from '../../domain/repository/redis.repository';

@Injectable()
export class RedisService implements RedisRepository {
    private redisClient: RedisClientType;

    constructor() {
        const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
        this.redisClient = createClient({
            url: redisURL,
        });

        this.redisClient.on('error', (err) =>
            console.error('Redis Client Error', err),
        );

        this.redisClient.connect();
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redisClient.set(key, value, { EX: ttl });
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async delete(key: string): Promise<void> {
        await this.redisClient.del(key);
    }
}
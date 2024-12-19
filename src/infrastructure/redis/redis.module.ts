import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: 'REDIS',
            useClass: RedisService,
        },
    ],
    exports: ['REDIS'],
})
export class RedisModule { }
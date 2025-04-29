import {Injectable, OnModuleInit} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
    private client: Redis;

    async onModuleInit() {
        this.client = new Redis({
            host: 'redis',
            port: 6379,
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    }
}

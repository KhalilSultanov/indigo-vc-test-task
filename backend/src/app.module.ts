import { Module } from '@nestjs/common';
import { GamesModule } from './games/games.module';
import {RedisService} from "./redis/redis.service";

@Module({
    imports: [GamesModule],
    providers: [RedisService],
    exports: [RedisService],
})
export class AppModule {}

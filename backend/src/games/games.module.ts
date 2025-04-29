import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import {RedisService} from "../redis/redis.service";

@Module({
  controllers: [GamesController],
  providers: [GamesService, RedisService]
})
export class GamesModule {}

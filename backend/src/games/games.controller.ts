import {Controller, Post, Body} from '@nestjs/common';
import {GamesService} from './games.service';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {
    }

    @Post()
    async getGamesInfo(@Body('urls') urls: string[]) {
        return this.gamesService.fetchGames(urls);
    }
}

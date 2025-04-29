import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {RedisService} from "../redis/redis.service";

@Injectable()
export class GamesService {
    constructor(private readonly redisService: RedisService) {
    }

    async fetchGames(urls: string[]) {
        console.time('fetch-all-games');

        const results = await Promise.allSettled(
            urls.map(url => this.fetchGameData(url)),
        );

        console.timeEnd('fetch-all-games');

        return results.map((result, index) => ({
            url: urls[index],
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason.message : null,
        }));
    }

    private async fetchGameData(url: string) {
        const match = url.match(/games\/(\d+)/);
        if (!match) {
            throw new Error('Invalid Roblox game URL');
        }
        const gameId = match[1];

        // Сначала ищем в Redis
        const cached = await this.redisService.get(gameId);
        if (cached) {
            return JSON.parse(cached);
        }

        const [gameResponse, iconResponse] = await Promise.all([
            axios.get(`https://games.roblox.com/v1/games?universeIds=${gameId}`),
            axios.get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${gameId}&size=512x512&format=Png&isCircular=false`),
        ]);

        const gameData = gameResponse.data.data[0];
        const iconData = iconResponse.data.data[0];

        if (!gameData) {
            throw new Error('Game not found');
        }

        const result = {
            id: gameData.id,
            name: gameData.name,
            description: gameData.description,
            creatorName: gameData.creator?.name || 'Unknown',
            playing: gameData.playing,
            visits: gameData.visits,
            maxPlayers: gameData.maxPlayers,
            created: gameData.created,
            genre: gameData.genre,
            iconUrl: iconData?.imageUrl || null,
        };

        await this.redisService.set(gameId, result);

        return result;
    }
}

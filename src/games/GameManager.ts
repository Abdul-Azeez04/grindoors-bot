import { GameEngine } from './GameEngine';

export class GameManager {
  // Map of channelId -> active GameEngine
  public static activeGames: Map<string, GameEngine> = new Map();
  
  public static getActiveGame(channelId: string): GameEngine | undefined {
    return this.activeGames.get(channelId);
  }
  
  public static setActiveGame(channelId: string, game: GameEngine): void {
    this.activeGames.set(channelId, game);
  }
  
  public static clearActiveGame(channelId: string): void {
    this.activeGames.delete(channelId);
  }
}

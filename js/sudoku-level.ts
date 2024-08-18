import { fetchHelper } from './utils/fetch-helper.js';
import { Level } from './interfaces/level';
import { staticLevel } from './levels/static-level.js';

export class SudokuLevel {
  private loadFromNetwork = false;
  private sudokuApiUrl: string;
  constructor() {
    this.sudokuApiUrl = 'https://sudoku-api.vercel.app/api/dosuku';
  }
  async load(): Promise<Level> {
    let response;
    if (this.loadFromNetwork) {
      try {
        response = await fetchHelper(this.sudokuApiUrl);
      } catch (error) {
        console.error(error);
      }
    }

    const game = response?.newboard?.grids[0];

    return {
      values: (game?.value || staticLevel.value).flat(1),
      difficulty: game?.difficulty || staticLevel.difficulty
    };
  }
}

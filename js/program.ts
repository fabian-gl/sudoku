import { Sudoku } from './sudoku.js';

const sudoku = new Sudoku();

const start = async () => {
  await sudoku.loadLevel();
};

start();

import { SudokuBoard } from './sudoku-board.js';
import { SudokuOptions } from './sudoku-options.js';
import { Sudoku } from './sudoku.js';
import { sleep } from './utils/sleep.js';

type Solution = number[];
export class SudokuSolver {
  private readonly options = new SudokuOptions();

  private solutions: Solution[] = [];

  private _isSolving = false;
  private solutionsLimit: number;
  private delay = 80;

  constructor(private readonly sudoku: Sudoku, private readonly board: SudokuBoard) {}

  async solve(solutionsLimit = 1) {
    this.solutionsLimit = solutionsLimit;

    this._isSolving = true;
    const initialValues = this.sudoku.values;

    // Options class will be the source of truth along the algorithm
    this.options.buildRestrictions(initialValues);

    await this.solveRecur();

    this.sudoku.values = initialValues;
    this.sudoku.buildRestrictions();

    this._isSolving = false;
  }

  private async solveRecur(): Promise<any> {
    const valCopy = this.options.values.slice();

    this.sudoku.values = valCopy;

    if (this.options.isComplete()) {
      await this.handleWin(valCopy);
      return true;
    }

    const allOptions = this.options.getAllOptions();
    this.board.printOptions(allOptions);

    const minOptsIndex = this.getMinOptionsIndex(allOptions);
    const options = allOptions[minOptsIndex];

    if (!options?.length) {
      console.log('DEAD END');
      await this.board.showWrong(minOptsIndex);
      return false;
    }

    for (const option of options) {
      if (this.solutions.length >= this.solutionsLimit) return;

      await sleep(this.delay);

      this.options.addRestriction(option, minOptsIndex);
      await this.solveRecur();
      this.options.removeRestriction(minOptsIndex);
    }
    return undefined;
  }

  private getMinOptionsIndex(allOptions: number[][]) {
    let minNumOptions = 10;
    let minNumOptionsIndex = null;

    for (let i = 0; i < allOptions.length; i++) {
      const option = allOptions[i];

      if (!option) continue;
      if (!option.length) return i;
      else if (option.length < minNumOptions) {
        minNumOptions = option.length;
        minNumOptionsIndex = i;
      }
    }

    return minNumOptionsIndex;
  }

  get isSolving() {
    return this._isSolving;
  }

  getSolution(solutionNumber: number) {
    return this.solutions[solutionNumber];
  }

  private async handleWin(values: number[]) {
    this.sudoku.addSolution(this.solutions.length);
    this.solutions.push(values);

    console.log('SOLUTION!');
    await this.board.showWin();
  }
}

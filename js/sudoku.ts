import { SudokuOptions } from './sudoku-options.js';
import { SudokuSolver } from './sudoku-solving.js';
import { SudokuLevel } from './sudoku-level.js';
import { SudokuBoard } from './sudoku-board.js';
import { getByIdOrFail } from './utils/get-element-or-fail.js';

export class Sudoku {
  private readonly board = new SudokuBoard();
  private readonly options = new SudokuOptions();
  private readonly solver = new SudokuSolver(this, this.board);
  private readonly level = new SudokuLevel();

  private _values = Array(81);

  private solutionsList = getByIdOrFail<HTMLSelectElement>('solutions-list');
  private showOptions = getByIdOrFail<HTMLInputElement>('show-options');

  constructor() {
    this.addEventListeners();
  }

  private addEventListeners() {
    this.addSolutionsListEventListeners();
    this.addKeyDownListener();
  }

  private addSolutionsListEventListeners() {
    this.solutionsList.addEventListener('change', (e) => {
      if (this.solver.isSolving) return;
      const solutionNumber = +this.solutionsList.value;
      const solution = this.solver.getSolution(solutionNumber);
      if (solution) this.setValuesAndPrint(solution);
    });

    this.showOptions.addEventListener('change', (_e) => {
      this.board.showOptions = this.showOptions?.checked;
    });
  }

  private addKeyDownListener() {
    document.addEventListener('keydown', ({ key }) => {
      if (this.solver.isSolving) return;

      if (key === 'p') this.solver.solve(2);

      const num = +key;
      if (!isNaN(num) && num) {
        this.insertValue(num);
      } else if (key === 'Delete') {
        this.removeValue();
      }
    });
  }

  private insertValue(value: number) {
    if (this.board.attemptInsertValue(value)) {
      const selected = this.board.selected;

      // If box already had a number, remove restrictions before adding new number
      if (this._values[selected]) {
        this.options.removeRestriction(selected);
        this._values[selected] = undefined;
      }

      this.checkInsertion(selected, value);
      this.options.addRestriction(value, selected);

      this._values[selected] = value;
      this.board.printOptions(this.options.getAllOptions());
      this.checkSolution();
    }
  }

  private removeValue() {
    const index = this.board.selected;
    this.options.removeRestriction(index);
    this._values[index] = undefined;

    this.board.removeSelectedValue();
    this.board.printOptions(this.options.getAllOptions());
  }

  private checkSolution() {
    if (!this.options.isComplete()) return false;

    if (this.options.isSolution()) {
      console.log('Lo lograste!');
      this.board.showWin(3000);
    } else {
      console.log('No es solición');
    }
  }

  private checkInsertion(index: number, insertionValue: number) {
    const isCorrect = this.options.getOptions(index)?.includes(insertionValue);
    this.board.setPosCorrectness(index, isCorrect);
  }

  addSolution(solutionNumber: number) {
    const option = document.createElement('option');
    option.value = `${solutionNumber}`;
    option.innerText = `Solution #${solutionNumber + 1}`;
    this.solutionsList.appendChild(option);
  }

  async loadLevel() {
    const { values } = await this.level.load();

    this._values = values.map((initialValue) => initialValue || undefined);

    this.buildRestrictions();
    this.board.printOptions(this.options.getAllOptions());

    this.board.loadLevel(values);
  }

  buildRestrictions() {
    this.options.buildRestrictions(this._values);
    this.board.printOptions(this.options.getAllOptions());
  }

  // For get and set values we transfer the values and not the references
  get values() {
    return this._values.slice();
  }

  set values(values: number[]) {
    this.setValuesAndPrint(values);
  }

  private setValuesAndPrint(values: number[]) {
    this._values = values.slice();
    this.board.print(this._values);
  }
}

import { coordinates } from './sudoku-coordinates.js';
import { AllOptions } from './sudoku-options.js';
import { getByIdOrFail } from './utils/get-element-or-fail.js';
import { sleep } from './utils/sleep.js';

export class SudokuBoard {
  private boardDiv = getByIdOrFail<HTMLDivElement>('board');

  private boxValues: HTMLDivElement[] = [];
  private boxOptions: HTMLSpanElement[] = [];

  private given: boolean[] = [];

  private _selected: number = undefined;
  private _showOptions = false;

  constructor() {
    this.buildBoard();
    this.addEventListeners();
  }

  private buildBoxGroups() {
    const boxGroups = [];
    for (let i = 0; i < 9; i++) {
      const boxGroup = document.createElement('div');
      boxGroup.classList.add('board-box-group');
      boxGroups.push(boxGroup);
      this.boardDiv.appendChild(boxGroup);
    }
    return boxGroups;
  }

  private buildBoard() {
    const boxGroups = this.buildBoxGroups();

    for (let i = 0; i < 9 * 9; i++) {
      const box = document.createElement('div');
      box.classList.add('board-box-container');

      const value = document.createElement('div');
      value.classList.add('board-box');
      value.id = `board-box#${i}`;
      this.boxValues.push(value);
      box.appendChild(value);

      const boxOption = document.createElement('span');
      boxOption.classList.add('options', 'hidden');

      this.boxOptions.push(boxOption);
      box.appendChild(boxOption);

      const { box: boxIndex } = coordinates(i);

      boxGroups[boxIndex].appendChild(box);
    }
  }

  private moveSelected(index: number) {
    if (this._selected !== undefined) {
      this.boxValues[this._selected].classList.remove('selected');
    }
    this.boxValues[index].classList.add('selected');
    this._selected = index;
  }

  get selected() {
    return this._selected;
  }

  private addEventListeners() {
    this.addClickListeners();
    this.addKeyDownListener();
  }

  private addClickListeners() {
    this.boardDiv.addEventListener('click', (e) => {
      const target = e.target as HTMLDivElement;

      const targetIndex = (target.id || '').split('#')[1];

      this.moveSelected(+targetIndex);
    });
  }

  private addKeyDownListener() {
    document.addEventListener('keydown', ({ key }) => {
      const direction = (key.split('Arrow')[1] || '').toLowerCase();
      if (direction) {
        let newSelected = this._selected ?? 40;
        const { row, column } = coordinates(newSelected);

        if (direction === 'up' && row > 0) newSelected -= 9;
        else if (direction === 'right' && column < 8) newSelected++;
        else if (direction === 'down' && row < 8) newSelected += 9;
        else if (direction === 'left' && column > 0) newSelected--;

        this.moveSelected(newSelected);
      }
    });
  }

  attemptInsertValue(value: number) {
    if (!this._selected || this.given[this._selected]) return false;
    this.boxValues[this._selected].innerText = `${value}`;
    return true;
  }

  removeSelectedValue() {
    this.boxValues[this._selected].innerText = '';
    this.setPosCorrectness(this._selected, true);
  }

  loadLevel(values: number[]) {
    this.boxValues.forEach((box, index) => {
      const isGiven = Boolean(values[index]);
      this.given[index] = isGiven;

      if (isGiven) box.classList.add('given');
      else box.classList.remove('given');

      box.innerText = values[index] ? `${values[index]}` : '';
    });

    this.print(values);
  }

  print(values: number[]) {
    this.boxValues.forEach((box, index) => {
      box.innerText = values[index] ? `${values[index]}` : '';
    });
  }

  printOptions(allOptions: AllOptions) {
    allOptions.forEach((possibleValues, index) => {
      this.boxOptions[index].innerText = (possibleValues || []).join(', ');
    });
  }

  setPosCorrectness(index: number, isCorrect: boolean) {
    if (isCorrect) this.boxValues[index].classList.remove('wrong');
    else this.boxValues[index].classList.add('wrong');
  }

  async showWin(delay = 1000) {
    this.boardDiv.classList.add('win-state');
    await sleep(delay);
    this.boardDiv.classList.remove('win-state');
  }

  async showWrong(index: number, delay = 1000) {
    if (!index) return;
    this.setPosCorrectness(index, false);
    await sleep(delay);
    this.setPosCorrectness(index, true);
  }

  set showOptions(value: boolean) {
    if (value === this._showOptions) return;

    if (value) {
      this.boxOptions.forEach((boxOption) => boxOption.classList.remove('hidden'));
    } else {
      this.boxOptions.forEach((boxOption) => boxOption.classList.add('hidden'));
    }
    this._showOptions = value;
  }
}

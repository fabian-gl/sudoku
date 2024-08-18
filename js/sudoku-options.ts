import { coordinates } from './sudoku-coordinates.js';

type GroupOptions = Record<number, number>;

export type AllOptions = number[][];

export class SudokuOptions {
  private rows: GroupOptions[] = [];
  private columns: GroupOptions[] = [];
  private boxes: GroupOptions[] = [];

  values: number[];

  constructor(values: number[] = []) {
    this.buildRestrictions(values);
  }

  private initMaps() {
    for (let i = 0; i < 9; i++) {
      this.rows[i] = this.getInitMap();
      this.columns[i] = this.getInitMap();
      this.boxes[i] = this.getInitMap();
    }
  }

  private getInitMap(): GroupOptions {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  }

  buildRestrictions(values: number[]) {
    this.initMaps();

    this.values = values;
    this.values.forEach((value, index) => {
      if (value) this.addRestriction(value, index);
    });
  }

  addRestriction(value: number, index: number) {
    this.values[index] = value;
    this.updateRestrictions(value, index, 1);
  }

  removeRestriction(index: number) {
    const value = this.values[index];
    this.updateRestrictions(value, index, -1);
    this.values[index] = undefined;
  }

  private updateRestrictions(value: number, index: number, diff: 1 | -1) {
    const { row, column, box } = coordinates(index);

    this.rows[row][value] += diff;
    this.columns[column][value] += diff;
    this.boxes[box][value] += diff;
  }

  getOptions(index: number) {
    if (this.values[index]) return null;
    const { row, column, box } = coordinates(index);

    const options = [];
    for (let i = 1; i <= 9; i++) {
      if (!this.rows[row][i] && !this.columns[column][i] && !this.boxes[box][i]) {
        options.push(i);
      }
    }
    return options;
  }

  getAllOptions(): AllOptions {
    return this.values.map((_value, index) => this.getOptions(index));
  }

  isSolution() {
    for (let j = 0; j < 9; j++) {
      for (let i = 1; i <= 9; i++) {
        if (this.rows[j][i] !== 1 || this.columns[j][i] !== 1 || this.boxes[j][i] !== 1) {
          return false;
        }
      }
    }
    return true;
  }

  isComplete() {
    return this.values.every((value) => Boolean(value));
  }
}

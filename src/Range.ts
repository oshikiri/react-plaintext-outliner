export class RangeSet {
  constructor(private ranges: Range[]) {}
  pushRange(l: number, r: number): void {
    this.ranges.push(new Range(l, r));
  }
  getLastRange(): Range | null {
    if (this.ranges.length === 0) {
      return null;
    }
    return this.ranges[this.ranges.length - 1];
  }
}

/**
 * [l, r] represents a range from l to r (inclusive).
 */
export class Range {
  constructor(
    public l: number,
    public r: number,
  ) {}
  contains(x: number): boolean {
    return this.l <= x && x <= this.r;
  }
}

/**
 * Example: content = "abc\ndef"
 *
 *  a|b|c|\n
 * 0 1 2 3
 *
 * |d|e|f|
 * 4 5 6 7
 */
export function getNewlineRangeset(content: string): RangeSet {
  const rangeset: RangeSet = new RangeSet([]);
  const regex = /(\n)/g;
  let match: RegExpExecArray | null;

  let l = 0;
  while ((match = regex.exec(content)) !== null) {
    rangeset.pushRange(l, match.index);
    l = match.index + 1;
  }

  if (l < content.length) {
    rangeset.pushRange(l, content.length);
  }

  return rangeset;
}

import { OverridableStringUnion } from '@mak/types';

export interface BreakpointOverrides {}

export type Breakpoint = OverridableStringUnion<
  'xs' | 'sm' | 'md' | 'lg' | 'xl',
  BreakpointOverrides
>;

// Keep in sync with docs/src/pages/customization/breakpoints/breakpoints.md
// #default-branch-switch
export interface Breakpoints {
  keys: Breakpoint[];
  /**
   * Each breakpoint (a key) matches with a fixed screen width (a value).
   * @default {
   *    // extra-small
   *    xs: 0,
   *    // small
   *    sm: 600,
   *    // medium
   *    md: 900,
   *    // large
   *    lg: 1200,
   *    // extra-large
   *    xl: 1536,
   * }
   */
  values: { [key in Breakpoint]: number };
  /**
   * @param key - A breakpoint key (`xs`, `sm`, etc.) or a screen width number in px.
   * @returns A media query string ready to be used with most styling solutions, which matches screen widths greater than the screen size given by the breakpoint key (inclusive).
   * @see [API documentation](https://mui.com/material-ui/customization/breakpoints/#theme-breakpoints-up-key-media-query)
   */
  up: (key: Breakpoint | number) => string;
  /**
   * @param key - A breakpoint key (`xs`, `sm`, etc.) or a screen width number in px.
   * @returns A media query string ready to be used with most styling solutions, which matches screen widths less than the screen size given by the breakpoint key (exclusive).
   * @see [API documentation](https://mui.com/material-ui/customization/breakpoints/#theme-breakpoints-down-key-media-query)
   */
  down: (key: Breakpoint | number) => string;
  /**
   * @param start - A breakpoint key (`xs`, `sm`, etc.) or a screen width number in px.
   * @param end - A breakpoint key (`xs`, `sm`, etc.) or a screen width number in px.
   * @returns A media query string ready to be used with most styling solutions, which matches screen widths greater than
   *          the screen size given by the breakpoint key in the first argument (inclusive) and less than the screen size given by the breakpoint key in the second argument (exclusive).
   * @see [API documentation](https://mui.com/material-ui/customization/breakpoints/#theme-breakpoints-between-start-end-media-query)
   */
  between: (start: Breakpoint | number, end: Breakpoint | number) => string;
  /**
   * @param key - A breakpoint key (`xs`, `sm`, etc.) or a screen width number in px.
   * @returns A media query string ready to be used with most styling solutions, which matches screen widths starting from
   *          the screen size given by the breakpoint key (inclusive) and stopping at the screen size given by the next breakpoint key (exclusive).
   * @see [API documentation](https://mui.com/material-ui/customization/breakpoints/#theme-breakpoints-only-key-media-query)
   */
  only: (key: Breakpoint) => string;
  /**
   * @param key - A breakpoint key (`xs`, `sm`, etc.).
   * @returns A media query string ready to be used with most styling solutions, which matches screen widths stopping at
   *          the screen size given by the breakpoint key (exclusive) and starting at the screen size given by the next breakpoint key (inclusive).
   */
  not: (key: Breakpoint) => string;
  /**
   * The unit used for the breakpoint's values.
   * @default 'px'
   */
  unit?: string | undefined;
}

export interface BreakpointsOptions extends Partial<Breakpoints> {
  /**
   * The increment divided by 100 used to implement exclusive breakpoints.
   * For example, `step: 5` means that `down(500)` will result in `'(max-width: 499.95px)'`.
   * @default 5
   */
  step?: number | undefined;
  /**
   * The unit used for the breakpoint's values.
   * @default 'px'
   */
  unit?: string | undefined;
}

const sortBreakpointsValues = (values: any) => {
  const breakpointsAsArray = Object.keys(values).map((key) => ({ key, val: values[key] })) || [];
  // Sort in ascending order
  breakpointsAsArray.sort((breakpoint1, breakpoint2) => breakpoint1.val - breakpoint2.val);
  return breakpointsAsArray.reduce((acc, obj) => {
    return { ...acc, [obj.key]: obj.val };
  }, {});
};

// Keep in mind that @media is inclusive by the CSS specification.
export default function createBreakpoints(breakpoints: BreakpointsOptions): Breakpoints {
  const {
    // The breakpoint **start** at this value.
    // For instance with the first breakpoint xs: [xs, sm). meaning 0 <= x < 600
    values = {
      xs: 0, // phone
      sm: 600, // tablet
      md: 900, // small laptop
      lg: 1200, // desktop
      xl: 1536, // large screen
    },
    unit = 'px',
    step = 5,
    ...other
  } = breakpoints;

  const sortedValues = sortBreakpointsValues(values);
  const keys = Object.keys(sortedValues) as Breakpoint[];

  function isBreakpoint(key: string): key is Breakpoint {
    return ['xs', 'sm', 'md', 'lg', 'xl'].includes(key);
  }

  function getBreakpointValue(key: Breakpoint | number): number {
    let value: number;

    if (typeof key === 'number') {
      value = key;
    } else {
      if (!isBreakpoint(key) && process.env.NODE_EVN !== 'production') {
        console.error(
          `MAK: breakpoint key value provided ${key} is invalid. Key should be "xs", "sm", "md", "lg", "xl"`,
        );
      }
      value = values[key] || 0;
    }

    return value;
  }

  function up(key: Breakpoint | number): string {
    return `@media (min-width:${getBreakpointValue(key)}${unit})`;
  }

  function down(key: Breakpoint | number): string {
    return `@media (max-width:${getBreakpointValue(key) - step / 100}${unit})`;
  }

  function between(start: Breakpoint | number, end: Breakpoint | number): string {
    return (
      `@media (min-width:${getBreakpointValue(start)}${unit}) and ` +
      `(max-width:${getBreakpointValue(end) - step / 100}${unit})`
    );
  }

  function only(key: Breakpoint) {
    if (keys.indexOf(key) + 1 < keys.length) {
      const endKey = keys[keys.indexOf(key) + 1] as Breakpoint;
      return between(key, endKey);
    }

    return up(key);
  }

  function not(key: Breakpoint) {
    // handle first and last key separately, for better readability
    const keyIndex = keys.indexOf(key);
    if (keyIndex === 0) {
      return up(keys[1] as Breakpoint);
    }
    if (keyIndex === keys.length - 1) {
      return down(keys[keyIndex] as Breakpoint);
    }

    return between(key, keys[keys.indexOf(key) + 1] as Breakpoint).replace(
      '@media',
      '@media not all and',
    );
  }

  return {
    keys,
    values: sortedValues,
    up,
    down,
    between,
    only,
    not,
    unit,
    ...other,
  };
}

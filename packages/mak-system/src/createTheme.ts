import { CSSObject } from '@mak/styled-engine';
import { deepmerge } from '@mak/utils';

import createBreakpoints from './createBreakpoints';
import type { Breakpoints, BreakpointsOptions } from './createBreakpoints';

import type { Shape, ShapeOptions } from './shape';
import shape from './shape';

import type { Spacing, SpacingOptions } from './createSpacing';
import createSpacing from './createSpacing';

import { SxConfig, SxProps } from '../styleFunctionSx';
import styleFunctionSx from '../styleFunctionSx/styleFunctionSx';
import defaultSxConfig from '../styleFunctionSx/defaultSxConfig';

export type Direction = 'ltr' | 'rtl';

export interface ThemeOptions {
  shape?: ShapeOptions;
  breakpoints?: BreakpointsOptions;
  direction?: Direction;
  mixins?: unknown;
  palette?: Record<string, any>;
  shadows?: unknown;
  spacing?: SpacingOptions;
  transitions?: unknown;
  components?: Record<string, any>;
  typography?: unknown;
  zIndex?: Record<string, number>;
  unstable_sxConfig?: SxConfig;
}

export interface Theme {
  shape: Shape;
  breakpoints: Breakpoints;
  direction: Direction;
  palette: Record<string, any> & { mode: 'light' | 'dark' };
  shadows?: unknown;
  spacing: Spacing;
  transitions?: unknown;
  components?: Record<string, any>;
  mixins?: unknown;
  typography?: unknown;
  zIndex?: unknown;
  unstable_sxConfig: SxConfig;
  unstable_sx: (props: SxProps<Theme>) => CSSObject;
}

/**
 * Generate a theme base on the options received.
 * @param options Takes an incomplete theme object and adds the missing parts.
 * @param args Deep merge the arguments with the about to be returned theme.
 * @returns A complete, ready-to-use theme object.
 */
export default function createTheme(options?: ThemeOptions, ...args: object[]): Theme {
  const { ...other } = options;

  const breakpointsInput = options?.breakpoints && {};
  const spacingInput = options?.spacing && {};
  const shapeInput = options?.shape && {};
  const paletteInput = options?.palette && {};

  const breakpoints = createBreakpoints(breakpointsInput);
  const spacing = createSpacing(spacingInput);

  let makTheme = deepmerge(
    {
      breakpoints,
      direction: 'ltr',
      components: {}, // Inject component definitions.
      palette: { mode: 'light', ...paletteInput },
      spacing,
      shape: shapeInput,
    },
    other,
  );

  makTheme = args.reduce((acc, argument) => deepmerge(acc, argument), makTheme);

  makTheme.unstable_sxConfig = {
    ...defaultSxConfig,
    ...other?.unstable_sxConfig,
  };

  makTheme.unstable_sx = function sx(props) {
    return styleFunctionSx({
      sx: props,
      theme: this,
    });
  };

  return makTheme;
}

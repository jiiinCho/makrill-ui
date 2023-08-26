'use client';
import { createStyled, shouldForwardProp } from '@mak/system';
import defaultTheme from './defaultTheme';
import THEME_ID from './identifier';

// if prop is not 'classes', rootshouldforwardProp is true. check usage
export const rootShouldForwardProp = (prop: string): boolean =>
  shouldForwardProp(prop) && prop !== 'classes';

export const slotShouldForwardProp = shouldForwardProp;

const styled = createStyled({
  themeId: THEME_ID,
  defaultTheme,
  rootShouldForwardProp,
});

export default styled;

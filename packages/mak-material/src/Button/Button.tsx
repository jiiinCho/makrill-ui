'use client'; // specify below codes are client side only, use it for next.js project or component library project
import * as React from 'react';
import styled, { rootShouldForwardProp } from '../styles/styled';

export type ButtonTypeMap<
  AdditionalProps = {},
  DefaultComponent extends React.ElementType = 'button',
> = ExtendedButtonBaseTypeMap<{
  props: AdditionalProps & {
    /**
     * The content of the component
     */
    children?: React.ReactNode;
    /**
     * Override or extend the styles applied to the component
     */
    classes?: Partial<ButtonClasses>;
    /**
     * The color of the component.
     * It supports both default and custom theme colors, which can be added as shown in the
     * [palette customization guide](https://mui.com/material-ui/customization/palette/#adding-new-colors).
     * * @default 'primary'
     */
    color?: OverridableStringUnion<
      'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
      ButtonPropsColorOverrides
    >;
  };
  defaultComponent: DefaultComponent;
}>;

const useUtilityClasses = (ownerState) => {
  const { color, disableElevation, fullWidth, size, variant, classes } = ownerState;

  const slots = {
    root: [
      'root',
      variant,
      `${variant}${capitalize(color)}`,
      `size${capitalize(size)}`,
      `${variant}Size${capitalize(size)}`,
      color === 'inherit' && 'colorInherit',
      disableElevation && 'disableElevation',
      fullWidth && 'fullWidth',
    ],
    label: ['label'],
    startIcon: ['startIcon', `iconSize${capitalize(size)}`],
    endIcon: ['endIcon', `iconSize${capitalize(size)}`],
  };

  const composedClasses = composeClasses(slots, getButtonUtilityClass, classes);

  return {
    ...classes, // forward the focused, disabled, etc. classes to the ButtonBase
    ...composedClasses,
  };
};

const commonIconStyles = (ownerState) => ({
  ...(ownerState.size === 'small' && {
    '& > *:nth-of-type(1)': { fontSize: 18 },
  }),
  ...(ownerState.size === 'medium' && {
    '& > *:nth-of-type(1)': { fontSize: 20 },
  }),
  ...(ownerState.size === 'large' && {
    '& > *:nth-of-type(1)': { fontSize: 22 },
  }),
});

const ButtonRoot = styled(ButtonBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MakButton',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      styles[ownerState.variant],
      styles[`${ownerState.variant}${capitalize(ownerState.color)}`],
      styles[`size${capitalize(ownerState.size)}`],
      styles[`${ownerState.variant}Size${capitalize(ownerState.size)}`],
      ownerState.color === 'inherit' && styles.colorInherit,
      ownerState.disableElevation && styles.disableElevation,
      ownerState.fullWidth && styles.fullWidth,
    ];
  },
})(
  ({ theme, ownerState }) => {
    const inheritContainedBackgroundColor =
      theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[800];

    const inheritContainedHoverBackgroundColor =
      theme.palette.mode === 'light' ? theme.palette.grey.A100 : theme.palette.grey[700];

    return {
      ...theme.typography.button,
      minWidth: 64,
      padding: '6px 16px',
      borderRadius: (theme.vars || theme).shape.borderRadius,
      transition: theme.transitions.create(
        ['background-color', 'box-shadow', 'border-color', 'color'],
        {
          duration: theme.transitions.duration.short,
        },
      ),
      '&:hover': {
        textDecoration: 'none',
        backgroundColor: theme.vars
          ? `rgba(${theme.vars.palette.text.primaryChannel} / ${theme.vars.palette.action.hoverOpacity})`
          : alpha(theme.palette.text.primary, theme.palette.action.hoverOpacity),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
        ...(ownerState.variant === 'text' &&
          ownerState.color !== 'inherit' && {
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette[ownerState.color].mainChannel} / ${
                  theme.vars.palette.action.hoverOpacity
                })`
              : alpha(theme.palette[ownerState.color].main, theme.palette.action.hoverOpacity),
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
              backgroundColor: 'transparent',
            },
          }),
        ...(ownerState.variant === 'outlined' &&
          ownerState.color !== 'inherit' && {
            border: `1px solid ${(theme.vars || theme).palette[ownerState.color].main}`,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette[ownerState.color].mainChannel} / ${
                  theme.vars.palette.action.hoverOpacity
                })`
              : alpha(theme.palette[ownerState.color].main, theme.palette.action.hoverOpacity),
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
              backgroundColor: 'transparent',
            },
          }),
        ...(ownerState.variant === 'contained' && {
          backgroundColor: theme.vars
            ? theme.vars.palette.Button.inheritContainedHoverBg
            : inheritContainedHoverBackgroundColor,
          boxShadow: (theme.vars || theme).shadows[4],
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            boxShadow: (theme.vars || theme).shadows[2],
            backgroundColor: (theme.vars || theme).palette.grey[300],
          },
        }),
        ...(ownerState.variant === 'contained' &&
          ownerState.color !== 'inherit' && {
            backgroundColor: (theme.vars || theme).palette[ownerState.color].dark,
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
              backgroundColor: (theme.vars || theme).palette[ownerState.color].main,
            },
          }),
      },
      '&:active': {
        ...(ownerState.variant === 'contained' && {
          boxShadow: (theme.vars || theme).shadows[8],
        }),
      },
      [`&.${buttonClasses.focusVisible}`]: {
        ...(ownerState.variant === 'contained' && {
          boxShadow: (theme.vars || theme).shadows[6],
        }),
      },
      [`&.${buttonClasses.disabled}`]: {
        color: (theme.vars || theme).palette.action.disabled,
        ...(ownerState.variant === 'outlined' && {
          border: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`,
        }),
        ...(ownerState.variant === 'contained' && {
          color: (theme.vars || theme).palette.action.disabled,
          boxShadow: (theme.vars || theme).shadows[0],
          backgroundColor: (theme.vars || theme).palette.action.disabledBackground,
        }),
      },
      ...(ownerState.variant === 'text' && {
        padding: '6px 8px',
      }),
      ...(ownerState.variant === 'text' &&
        ownerState.color !== 'inherit' && {
          color: (theme.vars || theme).palette[ownerState.color].main,
        }),
      ...(ownerState.variant === 'outlined' && {
        padding: '5px 15px',
        border: '1px solid currentColor',
      }),
      ...(ownerState.variant === 'outlined' &&
        ownerState.color !== 'inherit' && {
          color: (theme.vars || theme).palette[ownerState.color].main,
          border: theme.vars
            ? `1px solid rgba(${theme.vars.palette[ownerState.color].mainChannel} / 0.5)`
            : `1px solid ${alpha(theme.palette[ownerState.color].main, 0.5)}`,
        }),
      ...(ownerState.variant === 'contained' && {
        color: theme.vars
          ? // this is safe because grey does not change between default light/dark mode
            theme.vars.palette.text.primary
          : theme.palette.getContrastText?.(theme.palette.grey[300]),
        backgroundColor: theme.vars
          ? theme.vars.palette.Button.inheritContainedBg
          : inheritContainedBackgroundColor,
        boxShadow: (theme.vars || theme).shadows[2],
      }),
      ...(ownerState.variant === 'contained' &&
        ownerState.color !== 'inherit' && {
          color: (theme.vars || theme).palette[ownerState.color].contrastText,
          backgroundColor: (theme.vars || theme).palette[ownerState.color].main,
        }),
      ...(ownerState.color === 'inherit' && {
        color: 'inherit',
        borderColor: 'currentColor',
      }),
      ...(ownerState.size === 'small' &&
        ownerState.variant === 'text' && {
          padding: '4px 5px',
          fontSize: theme.typography.pxToRem(13),
        }),
      ...(ownerState.size === 'large' &&
        ownerState.variant === 'text' && {
          padding: '8px 11px',
          fontSize: theme.typography.pxToRem(15),
        }),
      ...(ownerState.size === 'small' &&
        ownerState.variant === 'outlined' && {
          padding: '3px 9px',
          fontSize: theme.typography.pxToRem(13),
        }),
      ...(ownerState.size === 'large' &&
        ownerState.variant === 'outlined' && {
          padding: '7px 21px',
          fontSize: theme.typography.pxToRem(15),
        }),
      ...(ownerState.size === 'small' &&
        ownerState.variant === 'contained' && {
          padding: '4px 10px',
          fontSize: theme.typography.pxToRem(13),
        }),
      ...(ownerState.size === 'large' &&
        ownerState.variant === 'contained' && {
          padding: '8px 22px',
          fontSize: theme.typography.pxToRem(15),
        }),
      ...(ownerState.fullWidth && {
        width: '100%',
      }),
    };
  },
  ({ ownerState }) =>
    ownerState.disableElevation && {
      boxShadow: 'none',
      '&:hover': {
        boxShadow: 'none',
      },
      [`&.${buttonClasses.focusVisible}`]: {
        boxShadow: 'none',
      },
      '&:active': {
        boxShadow: 'none',
      },
      [`&.${buttonClasses.disabled}`]: {
        boxShadow: 'none',
      },
    },
);

const Button = React.forwardRef(function Button(inProps, ref) {
  // props priority: `inProps` > `contextProps` > `themeDefaultProps`
  const contextProps = React.useContext(ButtonGroupContext);
  const resolvedProps = resolveProps(contextProps, inProps);
  const props = useThemeProps({ props: resolvedProps, name: 'MakButton' });
  const {
    children,
    color = 'primary',
    component = 'button',
    className,
    disabled = false,
    disableElevation = false,
    disableFocusRipple = false,
    endIcon: endIconProp,
    focusVisibleClassName,
    fullWidth = false,
    size = 'medium',
    startIcon: startIconProp,
    type,
    variant = 'text',
    ...other
  } = props;

  const ownerState = {
    ...props,
    color,
    component,
    disabled,
    disableElevation,
    disableFocusRipple,
    fullWidth,
    size,
    type,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  const startIcon = startIconProp && (
    <ButtonStartIcon className={classes.startIcon} ownerState={ownerState}>
      {startIconProp}
    </ButtonStartIcon>
  );

  const endIcon = endIconProp && (
    <ButtonEndIcon className={classes.endIcon} ownerState={ownerState}>
      {endIconProp}
    </ButtonEndIcon>
  );

  return (
    <ButtonRoot
      ownerState={ownerState}
      className={clsx(contextProps.className, classes.root, className)}
      component={component}
      disabled={disabled}
      focusRipple={!disableFocusRipple}
      focusVisibleClassName={clsx(classes.focusVisible, focusVisibleClassName)}
      ref={ref}
      type={type}
      {...other}
      classes={classes}
    >
      {startIcon}
      {children}
      {endIcon}
    </ButtonRoot>
  );
});

// @flow
import React, { Component } from 'react';
import type { ComponentType, Element } from 'react';

// internal components
import { withTheme } from './HOC/withTheme';

// internal utility functions
import { composeTheme, addThemeId } from '../utils/themes';

// import constants
import { IDENTIFIERS } from '../themes/API';

type Props = {
  className: string,
  context: {
    theme: Object,
    ROOT_THEME_API: Object
  },
  disabled: boolean,
  label: string | Element<any>,
  loading: boolean,
  onClick: Function,
  skin: ComponentType<any>,
  theme: Object, // will take precedence over theme in context if passed
  themeId: string,
  themeOverrides: Object // custom css/scss from user that adheres to component's theme API
};

type State = {
  composedTheme: Object
};

class ButtonBase extends Component<Props, State> {
  // define static properties
  static displayName = 'Button';
  static defaultProps = {
    disabled: false,
    loading: false,
    theme: null,
    themeId: IDENTIFIERS.BUTTON,
    themeOverrides: {}
  };

  constructor(props: Props) {
    super(props);

    const { context, themeId, theme, themeOverrides } = props;

    this.state = {
      composedTheme: composeTheme(
        addThemeId(theme || context.theme, themeId),
        addThemeId(themeOverrides, themeId),
        context.ROOT_THEME_API
      )
    };
  }

  render() {
    // destructuring props ensures only the "...rest" get passed down
    const {
      skin: ButtonSkin,
      theme,
      themeOverrides,
      context,
      ...rest
    } = this.props;

    return <ButtonSkin theme={this.state.composedTheme} {...rest} />;
  }
}

export const Button = withTheme(ButtonBase);

// @flow
import React, { Component } from 'react';
import type { ComponentType } from 'react';

// internal components
import { withTheme } from './HOC/withTheme';

// internal utility functions
import { composeTheme, addThemeId } from '../utils/themes';

// import constants
import { IDENTIFIERS } from '../themes/API';

type Props = {
  big?: boolean,
  className: string,
  context: {
    theme: Object,
    ROOT_THEME_API: Object
  },
  skin: ComponentType<any>,
  theme: Object, // will take precedence over theme in context if passed
  themeId: string,
  themeOverrides: Object,
  visible: boolean
};

type State = {
  composedTheme: Object
};

class LoadingSpinnerBase extends Component<Props, State> {
  // define static properties
  static displayName = 'LoadingSpinner';
  static defaultProps = {
    big: false,
    theme: null,
    themeId: IDENTIFIERS.LOADING_SPINNER,
    themeOverrides: {},
    visible: true
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
      skin: LoadingSpinnerSkin,
      theme,
      themeOverrides,
      context,
      ...rest
    } = this.props;

    return <LoadingSpinnerSkin theme={this.state.composedTheme} {...rest} />;
  }
}

export const LoadingSpinner = withTheme(LoadingSpinnerBase);

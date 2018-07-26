// @flow
import React, { Component } from 'react';
import { pickBy, isEmpty } from 'lodash';

// components
import { Base } from './Base';
import { GridItem } from './GridItem';
import { withTheme } from '../HOC/withTheme';

// utilities
import { numberToPx } from '../../utils/props';
import { formatTemplateAreas } from '../../utils/layout';
import { composeTheme, addThemeId } from '../../utils/themes';

// constants
import { IDENTIFIERS } from '../../themes/API';

type Props = {
  alignItems: string,
  autoColumns: string,
  autoRows: string,
  className: string,
  center: boolean,
  columnGap: string | number,
  columns: string,
  context: {
    theme: Object,
    ROOT_THEME_API: Object
  },
  gap: string | number,
  justifyItems: string,
  rowGap: string | number,
  rows: string,
  template: string,
  templateAreas: Array<''>,
  theme: Object,
  themeId: string,
  themeOverrides: Object
};

type State = { composedTheme: Object };

class GridBase extends Component<Props, State> {
  // define static properties
  static displayName = 'Grid';
  static defaultProps = {
    columnGap: 5,
    rowGap: 5,
    theme: null,
    themeId: IDENTIFIERS.GRID,
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

  // creates obj passed Base component's inline styles (see render)
  _assembleInlineGrid = () => {
    const { className, ...gridProps } = this.props;

    // return early if gridProps are empty
    if (isEmpty(pickBy({ ...gridProps }))) { return; }

    const {
      alignItems,
      autoColumns,
      autoRows,
      center,
      columnGap,
      columns,
      gap,
      justifyItems,
      rowGap,
      rows,
      template,
      templateAreas
    } = gridProps;

    // obj with correct css grid class names
    const inlineClasses = {
      alignItems: center ? 'center' : alignItems,
      gridAutoColumns: autoColumns,
      gridAutoRows: autoRows,
      gridTemplateColumns: columns,
      gridTemplateRows: rows,
      gridColumnGap: gap ? false : numberToPx(columnGap),
      gridGap: numberToPx(gap),
      gridRowGap: gap ? false : numberToPx(rowGap),
      gridTemplate: template,
      gridTemplateAreas: formatTemplateAreas(templateAreas),
      justifyItems: center ? 'center' : justifyItems
    };

    // filters out keys with false(sy) values
    return pickBy(inlineClasses);
  }

  renderChildren(theme: Object) {
    return React.Children.map(this.props.children, child => {
      if (child.type.displayName === 'GridItem') {
        return React.cloneElement(child, { theme });
      }
      return child;
    });
  }

  render() {
    const { themeId, className, ...gridProps } = this.props;

    const inlineGrid = this._assembleInlineGrid({ ...gridProps });
    const theme = this.state.composedTheme[themeId];

    return (
      <Base
        className={className}
        stylesToAdd={theme}
        activeClasses={['container']}
        inlineStyles={inlineGrid}
      >
        {this.renderChildren(theme)}
      </Base>
    );
  }
}

export const Grid = withTheme(GridBase);
Grid.Item = GridItem;

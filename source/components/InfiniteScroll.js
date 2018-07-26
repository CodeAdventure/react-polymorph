// @flow
import React, { Component } from 'react';
// $FlowFixMe
import createRef from 'create-react-ref/lib/createRef';

// internal components
import { withTheme } from './HOC/withTheme';

// utilities
import { composeTheme, addThemeId } from '../utils/themes';

// constants
import { IDENTIFIERS } from '../themes/API';

type Props = {
  context: {
    theme: Object,
    ROOT_THEME_API: Object
  },
  fetchData: Function,
  renderItems: Function,
  theme: Object, // will take precedence over theme in context if passed
  themeId: string,
  themeOverrides: Object,
  threshold: number
};

type State = {
  data: Object | Array,
  error: string | Element<*>,
  isLoading: boolean,
  hasMoreData: boolean
};

class InfiniteScrollBase extends Component<Props, State> {
  // declare ref types
  scrollContainer: ?Element<'div'>;

  // define static properties
  static displayName = 'InfiniteScroll';
  static defaultProps = {
    fetchData() {},
    theme: null,
    themeId: IDENTIFIERS.INFINITE_SCROLL,
    themeOverrides: {},
    threshold: 250
  };

  constructor(props: Props) {
    super(props);
    const { context, themeId, theme, themeOverrides } = props;

    // refs
    this.scrollContainer = createRef();

    this.state = {
      composedTheme: composeTheme(
        addThemeId(theme || context.theme, themeId),
        addThemeId(themeOverrides, themeId),
        context.ROOT_THEME_API
      ),
      data: [],
      error: false,
      isLoading: false,
      hasMoreData: true
    };
  }

  componentWillMount() {
    this.handleFetchData();
  }

  componentDidMount() {
    const { scrollContainer } = this;
    scrollContainer.current.addEventListener('scroll', this.handleScroll);
  }

  _isFunction = (renderProp: ?Function) => (renderProp && typeof renderProp === 'function');

  setError = (error: string | Element<*>) => this.setState({ error });

  handleFetchData = () => this.props.fetchData(this.setState.bind(this));

  checkForScrollBottom = () => {
    const { scrollContainer, props: { threshold } } = this;
    const { offsetHeight, scrollTop, scrollHeight } = scrollContainer.current;

    if (offsetHeight + scrollTop >= scrollHeight - threshold) {
      return this.handleFetchData();
    }
  };

  handleScroll = () => {
    const { error, isLoading, hasMoreData } = this.state;

    // return early for error, loading, or lack of future data
    if (error || isLoading || !hasMoreData) { return; }
    return this.checkForScrollBottom();
  };

  render() {
    const { renderItems, themeId } = this.props;
    const { composedTheme, ...restState } = this.state;
    const theme = composedTheme[themeId];

    if (!this._isFunction(renderItems)) { return null; }
    return (
      <div ref={this.scrollContainer} className={theme.root}>
        {renderItems({ ...restState, theme })}
      </div>
    );
  }
}

export const InfiniteScroll = withTheme(InfiniteScrollBase);

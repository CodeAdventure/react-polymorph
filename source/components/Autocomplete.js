// @flow
import React, { Component } from 'react';
import type { ComponentType, Element } from 'react';

// external libraries
import _ from 'lodash';

// interal components
import { GlobalListeners } from './HOC/GlobalListeners';

// internal utility functions
import { createEmptyContext, withTheme } from './HOC/withTheme';
import { composeTheme, addThemeId, didThemePropsChange } from '../utils/themes';
import { composeFunctions } from '../utils/props';

import { IDENTIFIERS } from '.';
import type { ThemeContextProp } from './HOC/withTheme';

export type AutocompleteProps = {
  className?: string,
  context: ThemeContextProp,
  error: ?string,
  invalidCharsRegex: RegExp,
  isOpeningUpward: boolean,
  label?: string | Element<any>,
  maxSelections?: number,
  requiredSelections: [number],
  requiredSelectionsInfo?: (required: number, actual: number) => string,
  maxVisibleOptions: number,
  multipleSameSelections: boolean,
  onChange?: Function,
  options: Array<any>,
  preselectedOptions?: Array<any>,
  placeholder?: string,
  renderSelections?: Function,
  renderOptions?: Function,
  skin?: ComponentType<any>,
  sortAlphabetically: boolean,
  theme: ?Object, // will take precedence over theme in context if passed
  themeId: string,
  themeOverrides: Object,
};

type State = {
  composedTheme: Object,
  error: string,
  filteredOptions: Array<any>,
  isOpen: boolean,
  inputValue: string,
  mouseIsOverOptions: boolean,
  selectedOptions: Array<any>,
  isRemoveWordClicked: boolean,
};

class AutocompleteBase extends Component<AutocompleteProps, State> {
  // declare ref types
  rootElement: ?Element<any>;
  inputElement: ?Element<'input'>;
  suggestionsElement: ?Element<any>;
  optionsElement: ?Element<any>;

  // define static properties
  static displayName = 'Autocomplete';
  static defaultProps = {
    context: createEmptyContext(),
    error: null,
    invalidCharsRegex: /[^a-zA-Z0-9\s]/g, // only allow letters and numbers by default
    isOpeningUpward: false,
    maxVisibleOptions: 10, // max number of visible options
    multipleSameSelections: true, // if true then same word can be selected multiple times
    options: [],
    requiredSelections: [],
    sortAlphabetically: true, // options are sorted alphabetically by default
    theme: null,
    themeId: IDENTIFIERS.AUTOCOMPLETE,
    themeOverrides: {},
  };

  constructor(props: AutocompleteProps) {
    super(props);

    // define refs
    this.rootElement = React.createRef();
    this.inputElement = React.createRef();
    this.suggestionsElement = React.createRef();
    this.optionsElement = React.createRef();

    const {
      context,
      themeId,
      theme,
      themeOverrides,
      sortAlphabetically,
      options,
      preselectedOptions,
    } = props;

    this.state = {
      inputValue: '',
      error: '',
      selectedOptions: preselectedOptions || [],
      filteredOptions:
        sortAlphabetically && options ? options.sort() : options || [],
      isOpen: false,
      isRemoveWordClicked: false,
      mouseIsOverOptions: false,
      composedTheme: composeTheme(
        addThemeId(theme || context.theme, themeId),
        addThemeId(themeOverrides, themeId),
        context.ROOT_THEME_API
      ),
    };
  }

  componentDidUpdate(prevProps: AutocompleteProps) {
    if (prevProps !== this.props) {
      didThemePropsChange(prevProps, this.props, this.setState.bind(this));
    }
  }

  clear = () => this._removeOptions();

  focus = () => {
    const { inputElement } = this;
    if (inputElement && inputElement.current) {
      inputElement.current.focus();
    }
  };

  open = () => this.setState({ isOpen: true });

  close = () => this.setState({ isOpen: false });

  toggleOpen = () => {
    if (
      this.state.isOpen &&
      this.optionsElement &&
      this.optionsElement.current
    ) {
      // set Options scroll position to top on close
      this.optionsElement.current.scrollTop = 0;
    }
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  };

  toggleMouseLocation = () =>
    this.setState((prevState) => ({
      mouseIsOverOptions: !prevState.mouseIsOverOptions,
    }));

  handleAutocompleteClick = () => {
    this.focus();
  };

  onKeyDown = (event: SyntheticKeyboardEvent<>) => {
    if (event) {
      if (
        // Check for backspace in order to delete the last selected option
        event.keyCode === 8 &&
        !event.target.value &&
        this.state.selectedOptions.length
      ) {
        // Remove last selected option
        this.close();
        this.removeOption(this.state.selectedOptions.length - 1);
      } else if (event.keyCode === 27) {
        // ESCAPE key: Stops propagation & modal closing
        event.stopPropagation();
      } else if (event.keyCode === 13) {
        // ENTER key: Opens suggestions
        this.open();
      }
    }
  };

  // onChange handler for input element in AutocompleteSkin
  handleInputChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const multipleValues = value.split(' ');
    const hasMultipleValues = multipleValues.length > 1;
    this._setInputValue(value);
    if (hasMultipleValues) {
      this.open();
    }
    this.updateSelectedOptions(multipleValues, multipleValues.length === 1);
  };

  // passed to Options onChange handler in AutocompleteSkin
  handleChange = (option: any) => {
    this.updateSelectedOptions(option);
  };

  updateSelectedOptions = (
    addedOption: string | Array<string>,
    singleInput?: boolean
  ) => {
    const { maxSelections, multipleSameSelections, options } = this.props;
    const { selectedOptions, isOpen } = this.state;
    const { filteredOptions } = this.state;
    const canMoreOptionsBeSelected =
      maxSelections != null ? selectedOptions.length < maxSelections : true;
    const areFilteredOptionsAvailable =
      filteredOptions && filteredOptions.length > 0;
    let skipValueSelection = false;
    if (
      !maxSelections ||
      (canMoreOptionsBeSelected && areFilteredOptionsAvailable)
    ) {
      if (!addedOption || !addedOption.length) return;
      const option = _.isString(addedOption)
        ? addedOption.trim()
        : addedOption.filter((item) => item !== '');
      const newSelectedOptions: Array<string> = [...selectedOptions];

      if (option && Array.isArray(option)) {
        option.forEach((item) => {
          const optionCanBeSelected =
            (multipleSameSelections &&
              options.includes(item) &&
              !singleInput &&
              option.length > 1) ||
            (options.includes(item) &&
              !selectedOptions.includes(item) &&
              !newSelectedOptions.includes(item) &&
              option.length > 1);
          if (
            (!optionCanBeSelected && !skipValueSelection) ||
            (singleInput && !selectedOptions.length)
          ) {
            this._setInputValue(item, true);
            skipValueSelection = true;
            return;
          }
          if (
            item &&
            optionCanBeSelected &&
            isOpen &&
            !skipValueSelection &&
            newSelectedOptions.length < maxSelections
          ) {
            newSelectedOptions.push(item);
          }
        });
      } else {
        const optionCanBeSelected =
          multipleSameSelections || !selectedOptions.includes(option);
        if (option && optionCanBeSelected && isOpen) {
          newSelectedOptions.push(option);
          skipValueSelection = false;
        }
      }
      this.selectionChanged(newSelectedOptions);
      this.setState({ selectedOptions: newSelectedOptions });
    } else {
      skipValueSelection = true;
    }
    if (!skipValueSelection) {
      this._setInputValue('');
    }
  };

  removeOption = (index: number) => {
    console.log(index);
    const { selectedOptions } = this.state;
    _.pullAt(selectedOptions, index);
    this.close();
    this.selectionChanged(selectedOptions);
    this.setState({ selectedOptions });
    this.focus();
  };

  selectionChanged = (selectedOptions: Array<any>) => {
    if (this.props.onChange) this.props.onChange(selectedOptions);
  };

  // returns an object containing props, theme, and method handlers
  // associated with rendering this.state.selectedOptions, the user can call
  // this in the body of the renderSelections function
  getSelectionProps = ({
    removeSelection,
  }: { removeSelection: Function } = {}) => {
    const { themeId } = this.props;
    const { inputValue, isOpen, selectedOptions, composedTheme } = this.state;
    return {
      inputValue,
      isOpen,
      selectedOptions,
      theme: composedTheme[themeId],
      removeSelection: (index: number) =>
        // the user's custom removeSelection event handler is composed with
        // the internal functionality of Autocomplete (this.removeOption)
        composeFunctions(removeSelection, this.removeOption)(index),
    };
  };

  render() {
    // destructuring props ensures only the "...rest" get passed down
    const {
      context,
      invalidCharsRegex,
      multipleSameSelections,
      sortAlphabetically,
      skin,
      theme,
      themeOverrides,
      onChange,
      error,
      ...rest
    } = this.props;

    const AutocompleteSkin = skin || context.skins[IDENTIFIERS.AUTOCOMPLETE];

    return (
      <GlobalListeners
        mouseIsOverOptions={this.state.mouseIsOverOptions}
        optionsIsOpen={this.state.isOpen}
        optionsIsOpeningUpward={this.props.isOpeningUpward}
        optionsRef={this.optionsElement}
        rootRef={this.rootElement}
        toggleOpen={this.toggleOpen}
      >
        {({ optionsMaxHeight, optionHeight }) => (
          <AutocompleteSkin
            error={error || this.state.error}
            filteredOptions={this.state.filteredOptions}
            getSelectionProps={this.getSelectionProps}
            handleAutocompleteClick={this.handleAutocompleteClick}
            handleChange={this.handleChange}
            handleInputChange={this.handleInputChange}
            inputRef={this.inputElement}
            inputValue={this.state.inputValue}
            isOpen={this.state.isOpen}
            onKeyDown={this.onKeyDown}
            optionsMaxHeight={optionsMaxHeight}
            optionsRef={this.optionsElement}
            removeOption={this.removeOption}
            rootRef={this.rootElement}
            selectedOptions={this.state.selectedOptions}
            suggestionsRef={this.suggestionsElement}
            theme={this.state.composedTheme}
            toggleMouseLocation={this.toggleMouseLocation}
            toggleOpen={this.toggleOpen}
            optionHeight={optionHeight}
            {...rest}
          />
        )}
      </GlobalListeners>
    );
  }

  // ======== PRIVATE METHOD ==========

  _removeOptions = () => {
    const { onChange } = this.props;
    onChange ? onChange([]) : null;
    this.setState({ selectedOptions: [], inputValue: '' });
  };

  _filterOptions = (value: string) => {
    let filteredOptions = [];

    if (value !== '') {
      _.some(this.props.options, (option) => {
        if (_.startsWith(option, value)) {
          filteredOptions.push(option);
        }
      });
    } else {
      filteredOptions = this.props.options;
    }

    return filteredOptions;
  };

  _filterInvalidChars = (value: string) => {
    let filteredValue = '';

    if (this.props.invalidCharsRegex.test(value)) {
      filteredValue = value.replace(this.props.invalidCharsRegex, '');
    } else {
      filteredValue = value;
    }

    return filteredValue;
  };

  _setInputValue = (value: string, shouldFocus?: boolean) => {
    const multipleValues = value.split(' ');
    if (multipleValues && multipleValues.length > 1) {
      let selectedOptions = [];
      multipleValues.forEach((itemValue) => {
        const filteredValue = this._filterInvalidChars(itemValue);
        selectedOptions = [
          ...selectedOptions,
          ...this._filterOptions(filteredValue),
        ];
      });
      this.setState({
        isOpen: !!multipleValues.length,
        inputValue: '',
        filteredOptions: Array.from(new Set(selectedOptions)),
      });
    } else {
      const filteredValue = this._filterInvalidChars(value);
      const filteredOptions = this._filterOptions(filteredValue);
      this.setState({
        isOpen: value === '' ? false : !!value,
        inputValue: filteredValue,
        filteredOptions,
      });
      setTimeout(() => {
        if (shouldFocus) this.focus();
      }, 0);
    }
  };
}

export const Autocomplete = withTheme(AutocompleteBase);

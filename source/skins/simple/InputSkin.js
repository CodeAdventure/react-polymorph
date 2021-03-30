// @flow
import React, { useState } from 'react';
import type { ElementRef } from 'react';

// external libraries
import classnames from 'classnames';
import { isFunction } from 'lodash';

// components
import { FormField } from '../../components/FormField';
import type { InputProps } from '../../components/Input';

// internal utility functions
import { pickDOMProps } from '../../utils/props';

type Props = InputProps & {
  theme: Object,
  themeId: string,
};

export const InputSkin = (props: Props) => {
  const renderInput = (setFormFieldRef) => (
    <input
      ref={setFormFieldRef}
      {...pickDOMProps(props)}
      className={classnames([
        props.theme[props.themeId].input,
        props.disabled ? props.theme[props.themeId].disabled : null,
        props.error || props.showErrorState
          ? props.theme[props.themeId].errored
          : null,
      ])}
    />
  );

  const renderInputWithSearch = (setFormFieldRef) => (
    <div>COMING SOON</div>
  );


  const useSelectionRenderer = (setFormFieldRef, option) => (
    <div className={props.theme[props.themeId].customValueWrapper}>
      {renderInput(setFormFieldRef)}
      <div className={props.theme[props.themeId].customValueBlock}>
        {option && props.selectionRenderer && props.selectionRenderer(option)}
      </div>
    </div>
  );

  const render = (setFormFieldRef) => {
    // check if user has passed render prop "selectionRenderer"
    const hasSelectionRenderer =
      props.selectionRenderer && isFunction(props.selectionRenderer);
    if (hasSelectionRenderer) {
      return useSelectionRenderer(setFormFieldRef, props.selectedOption);
    }
    // check if user has passed the `hasSearch` prop
    const { hasSearch} = props;
    if (hasSearch) {
      return renderInputWithSearch(setFormFieldRef);
    }
    return renderInput(setFormFieldRef);
  };

  return (
    <FormField
      className={props.className}
      disabled={props.disabled}
      label={props.label}
      error={props.error}
      formFieldRef={props.inputRef}
      theme={props.theme}
      render={render}
    />
  );
};

// @flow
import Tippy from '@tippyjs/react';
import { isString, merge } from 'lodash';
import classnames from 'classnames';
import Popper from 'popper.js';
import React, { forwardRef, Node } from 'react';
import type { PopOverProps } from '../../components/PopOver';

const PopOverWrapper = forwardRef(
  (
    props: {
      children?: ?Node,
      className?: string,
    },
    ref
  ) => {
    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      <span className={props.className} tabIndex="0" ref={ref}>
        {props.children}
      </span>
    );
  }
);

export function PopOverSkin(props: PopOverProps) {
  const {
    allowHTML,
    children,
    content,
    contentClassName,
    isVisible,
    popperOptions,
    theme,
    themeId,
    themeOverrides,
    themeVariables,
    ...tippyProps
  } = props;
  return (
    <Tippy
      offset={[0, 14]}
      {...tippyProps}
      visible={isVisible}
      content={
        isString(content) && allowHTML ? (
          <span dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        )
      }
      className={classnames([theme[themeId].root])}
      theme="polymorph"
      plugins={[
        {
          // Makes it possible to pass themeVariables props to PopOvers
          name: 'cssVariables',
          defaultValue: {},
          fn(instance: Popper) {
            return {
              onCreate() {
                const { cssVariables } = instance.props;
                Object.keys(cssVariables).forEach((key) => {
                  instance.popper.style.setProperty(key, cssVariables[key]);
                });
              },
            };
          },
        },
      ]}
      popperOptions={{
        ...popperOptions,
        modifiers: [
          {
            name: 'computeStyles',
            options: {
              // Necessary to avoid sub-pixel rendering issues with arrows
              gpuAcceleration: false, // true by default
            },
          },
          {
            name: 'preventOverflow',
            options: {
              // Keep a 4px distance from the viewport edges
              padding: 4,
            },
          },
        ].concat(popperOptions.modifiers ?? []),
      }}
      cssVariables={themeVariables}
    >
      <PopOverWrapper className={contentClassName}>{children}</PopOverWrapper>
    </Tippy>
  );
}
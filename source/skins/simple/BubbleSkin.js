// @flow
import React from 'react';
import type { Node, Ref } from 'react';

// external libraries
import classnames from 'classnames';

// internal utility functions
import { pickDOMProps } from '../../utils';

type Props = {
  children: Node,
  className: string,
  isFloating: boolean,
  isHidden: boolean,
  isOpeningUpward: boolean,
  isTransparent: boolean,
  position: Object,
  rootRef: Ref<*>,
  theme: Object,
  themeId: string
};

export default (props: Props) => {
  const { theme, themeId } = props;

  return (
    <div
      ref={props.rootRef}
      {...pickDOMProps(props)}
      className={classnames([
        props.className,
        theme[themeId].root,
        props.isOpeningUpward ? theme[themeId].openUpward : null,
        props.isTransparent ? theme[themeId].transparent : null,
        props.isFloating ? theme[themeId].isFloating : null,
        props.isHidden ? theme[themeId].isHidden : null
      ])}
      style={
        props.position && {
          [props.isOpeningUpward ? 'bottom' : 'top']: props.position.positionY,
          left: props.position.positionX,
          width: props.position.width
        }
      }
    >
      <div className={theme[themeId].bubble} data-bubble-container>
        {props.children}
      </div>
      <span className={theme[themeId].arrow} data-bubble-arrow />
    </div>
  );
};

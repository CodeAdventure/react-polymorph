// @flow
import React from 'react';
import type { Element } from 'react';

// external libraries
import classnames from 'classnames';
import { times } from 'lodash';

type Props = {
  activeColumn: number | null,
  className: string,
  displayOnly: boolean,
  label: string | Element<any>,
  mnemonicWords: Object,
  setActiveColumn: Function,
  theme: Object,
  themeId: string,
  totalColumns: number,
  totalWords: number,
  totalWordsEntered: number,
};

export const MnemonicEntrySkin = (props: Props) => {
 const {
  activeColumn,
  className,
  displayOnly,
  label,
  mnemonicWords,
  setActiveColumn,
  themeId,
  totalColumns,
  totalWords,
  totalWordsEntered,
 } = props;
 const theme = props.theme[themeId];

 const blurredOrVisible = (columnNumber: number): string => (
  columnNumber === activeColumn ? 'visible' : 'blurred'
 );

 const renderInnerColumn = (columnNumber: number) => {
  const wordsPerColumn = totalWords / totalColumns;
  const controlBlurr = theme[`${blurredOrVisible(columnNumber + 1)}`];
  const disableClick = columnNumber + 1 === activeColumn && false;
  return (
    <ul>
      {times(wordsPerColumn, iteree => {
        const wordNumber = wordsPerColumn * columnNumber + (iteree + 1);
        if (displayOnly) {
          return (
            <li key={iteree} className={classnames([theme.word, controlBlurr])}>
              {wordNumber}. {mnemonicWords[wordNumber]}
            </li>
          );
        }
        return (
          <li key={iteree} className={classnames([theme.word, controlBlurr])}>
            {wordNumber}. <input disabled={disableClick} className={classnames([theme.wordInput, controlBlurr])} />
          </li>
        );
      })}
    </ul>
  );
 };

 return (
   <div className={classnames([className, theme.root])}>
     <div className={theme.labelWrapper}>
       {label && (
         <label
           role="presentation"
           aria-hidden
           className={theme.label}
         >
           {label}
         </label>
      )}
       {totalWords && !displayOnly && (
         <label
           role="presentation"
           aria-hidden
           className={theme.wordsEntered}
         >
           {totalWordsEntered} of {totalWords} words entered
         </label>
      )}
     </div>
     <div className={theme.columnsWrapper}>
       {times(totalColumns, (columnNumber) => {
         const controlBlurr = theme[`${blurredOrVisible(columnNumber + 1)}`];
         const disableClick = columnNumber + 1 === activeColumn || false;
         const disabledClass = columnNumber + 1 === activeColumn && theme.disabled;
         const handleSetActiveColumn = setActiveColumn.bind(null, columnNumber + 1);

         return (
           <button
             className={classnames([theme.columnWrapper, disabledClass])}
             disabled={disableClick}
             onClick={handleSetActiveColumn}
           >
             <div key={columnNumber} className={theme.column}>
               <div className={classnames([theme.columnCover, controlBlurr])} />
               {renderInnerColumn(columnNumber)}
             </div>
           </button>
         );
       })}
     </div>
   </div>
 );
};

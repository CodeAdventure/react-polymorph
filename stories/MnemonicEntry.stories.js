// @flow
import React from 'react';

// storybook
import { storiesOf } from '@storybook/react';

// components
import { MnemonicEntry } from '../source/components/MnemonicEntry';

// // theme overrides and styles
import styles from './MnemonicEntry.stories.scss';
import { decorateWithSimpleTheme } from './helpers/theming';

const MNEMONIC_WORDS = [
  'dog',
  'cat',
  'fish',
  'bird',
  'horse',
  'dinosaur',
  'lane',
  'curve',
  'street',
  'boy',
  'river',
  'run',
  'climb',
  'over',
  'music',
];

storiesOf('MnemonicEntry', module)

  .addDecorator(decorateWithSimpleTheme)

  // ======  Stories ======

  .add('Mnemonic Entry - Display Words', () => (
    <MnemonicEntry label="Write Down Your Recovery Phrase" mnemonicWords={MNEMONIC_WORDS} totalColumns={3} />
  ))

  .add('Mnemonic Entry - Input Words', () => (
    <MnemonicEntry
      displayOnly={false}
      label="Enter Your Recovery Phrase"
      mnemonicWords={MNEMONIC_WORDS}
      totalColumns={3}
    />
  ));

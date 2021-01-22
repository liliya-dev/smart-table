import React from 'react';

import style from './Header.module.scss';
import TextareaAutosize from 'react-textarea-autosize';

export const Header = ({ tableHeaders, editHeaderTitle, addColumn }) => {
  return (
    <thead>
      <tr>
        {
          tableHeaders.map((header, index) => (
            <th key={header.id}>
              <TextareaAutosize 
                spellCheck="false"
                value={header.text} 
                onChange={(event) => editHeaderTitle(index, event.target.value)}
                className={style.textarea}
              />
            </th>
          ))
        }
      </tr>
      <button type='button' onClick={addColumn}>
        +
      </button>
    </thead>
  )
}
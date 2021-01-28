import React, { useState, useEffect } from 'react';

import style from './Header.module.scss';
import TextareaAutosize from 'react-textarea-autosize';

export const Header = ({ tableHeaders, checkUniqueColumn }) => {
  const [headers, setHeaders] = useState(tableHeaders);
  const onEdit = (index, event) => {
    const key = event.key;
    if (key === 'Enter') {
      event.preventDefault();
      checkUniqueColumn(index, event.target.value);
      event.currentTarget.blur();
    }
  }

  useEffect(() => {
    setHeaders([...tableHeaders]);
  }, [tableHeaders]);

  return (
    <thead>
      <tr>
        {
          headers.map((header, index) => {
            return (
              <th key={index} className={style.ceil}>
                <TextareaAutosize 
                  spellCheck="false"
                  value={header}
                  onChange={(event) => {
                    const newHeaders = [...headers];
                    newHeaders[index] = event.target.value;
                    setHeaders([...newHeaders]);
                    event.target.focus();
                  }}
                  onBlur={(event) => checkUniqueColumn(index, event.target.value)}
                  onKeyDown={(event) => onEdit(index, event)}
                  className={style.textarea}
                />
              </th>
            )
          }
          )
        }
      </tr>
    </thead>
  )
}

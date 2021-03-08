import React, { useState, useEffect } from 'react';

import style from './Header.module.scss';
import TextareaAutosize from 'react-textarea-autosize';

export const Header = ({ tableHeaders, checkUniqueColumn, detectStyle, onHeaderEdit }) => {
  const [headers, setHeaders] = useState(tableHeaders);
  const onEdit = (index, event) => {
    const key = event.key;
    if (key === 'Enter') {
      event.preventDefault();
      checkUniqueColumn(index, event.target.value);
      event.currentTarget.blur();
    }
  }

  const handleChange = (event, index) => {
    const newHeaders = [...headers];
    newHeaders[index] = event.target.value;
    setHeaders([...newHeaders]);
    onHeaderEdit(newHeaders)
    event.target.focus();
  }

  useEffect(() => {
    setHeaders([...tableHeaders]);
  }, [tableHeaders]);

  return (
    <thead style={detectStyle('tableHead')}>
      <tr style={detectStyle('tableHeadRow')}>
        {
          headers.map((header, index) => {
            return (
              <th 
                key={index} 
                className={style.ceil}
                style={detectStyle('tableHeadCeil')}
              >
                <TextareaAutosize 
                  spellCheck="false"
                  value={header}
                  style={detectStyle('tableHeadTextarea')}
                  onChange={(event) => handleChange(event, index)}
                  onBlur={(event) => checkUniqueColumn(index, event.target.value)}
                  onKeyDown={(event) => onEdit(index, event)}
                  className={style.textarea}
                />
              </th>
            )
          })
        }
      </tr>
    </thead>
  )
}

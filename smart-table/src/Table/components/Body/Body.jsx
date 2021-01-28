import React from 'react';

import style from './Body.module.scss';
import TextareaAutosize from 'react-textarea-autosize';

export const Body = ({ 
  tableData, tableHeaders, emptyCeil, editCeil 
}) => {
  return (
    <tbody>
      {
        tableData.map((item, i) => {
          return (
            <tr key={i}>
              {
                tableHeaders.map((header, j) => {
                  const value = item[header] ? item[header] : emptyCeil;
                  return (
                    <td key={j + i + header}>
                      <TextareaAutosize 
                        className={style.textarea}
                        value={value} 
                        onChange={(event) => editCeil(header, event.target.value, i)}
                      />
                    </td>
                  )
                })
              }
            </tr>
          )
        })
      }
    </tbody>
  )
}
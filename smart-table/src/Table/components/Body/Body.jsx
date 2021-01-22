import React from 'react';

import style from './Body.module.scss';
import TextareaAutosize from 'react-textarea-autosize';

export const Body = ({ tableData, tableHeaders, emptyCeil, editCeil }) => {
  return (
    <tbody>
      {
        tableData.map((item, i) => {
          return (
            <tr key={i}>
              {
                tableHeaders.map((header, j) => {
                  const value = item[header.text] ? item[header.text] : emptyCeil;
                  return (
                    <td key={j + i + header.id}>
                      <TextareaAutosize 
                        className={style.textarea}
                        value={value} 
                        onChange={(event) => editCeil(header.text, event.target.value, i)}
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
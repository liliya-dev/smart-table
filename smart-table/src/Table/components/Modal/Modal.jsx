import React, { useState } from 'react';

import style from './Modal.module.scss';

export const Modal = ({ headerValue, checkUniqueColumn, index }) => {
  const [newValue, setNewValue] = useState(headerValue);

  return (
    <div className={style.container}>
      <div className={style.modal}>
        <p>
          Column with name <b>{ headerValue }</b> is already exists.
        </p>
        <p>
          Change column name, please
        </p>
        <input 
          type="text" 
          value={newValue} 
          onChange={(event) => setNewValue(event.target.value)}
        />
        <button 
          type="button"
          onClick={() => checkUniqueColumn(index, newValue)}
        >
          Set new value
        </button>
      </div>
    </div>
  )
}
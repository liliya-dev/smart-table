import React, { useState } from 'react';

import style from './Table.module.scss';
import { Header } from './components/Header/Header';
import { Body } from './components/Body/Body';

export const Table = ({ headers, data, emptyCeil }) => {

  const [tableHeaders, setTableHeaders] = useState(headers);
  const [tableData, setTableData] = useState(data);

  const editCeil = (head, value, index) => {
    const newTableData = JSON.parse(JSON.stringify(tableData));
    newTableData[index][head] = value;
    setTableData(newTableData);
  }

  const sendData = () => {
    const editedData = {
      headers: [...tableHeaders],
      data: tableData
    };
    return editedData
  }

  const addColumn = () => {
    const isSameTitleInHeaders = tableHeaders.some(header => header.text === 'Title')
    const newHeader = {
      id: Date.now(),
      text: 'Title'
    }
    setTableHeaders([...tableHeaders, newHeader])
  }

  const editHeaderTitle = (index, value) => {
    const newHeaders = JSON.parse(JSON.stringify(tableHeaders));
    newHeaders[index].text = value;
    setTableHeaders([...newHeaders]);
    const headerToEdit = tableHeaders[index];
    const newTableData = JSON.parse(JSON.stringify(tableData));
    newTableData.forEach(item => {
      item[value] = item[headerToEdit.text];
      delete item[headerToEdit.text];
    })
    setTableData(newTableData);
  }

  return (
    <div className={style.container}>
      <table className={style.table}>
        <Header 
          tableHeaders={tableHeaders} 
          editHeaderTitle={editHeaderTitle} 
          addColumn={addColumn}
        />
        <Body 
          tableData={tableData}
          editCeil={editCeil}
          tableHeaders={tableHeaders}
          emptyCeil={emptyCeil}
        />
      </table>
      <button type='button' onClick={sendData}>Send data to user</button>
    </div>
  )
}
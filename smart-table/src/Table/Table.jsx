import React, { useState } from 'react';

import style from './Table.module.scss';
import { Header } from './components/Header/Header';
import { Body } from './components/Body/Body';
import { Modal } from './components/Modal/Modal';

export const Table = ({ headers, data, emptyCeil }) => {

  const [tableHeaders, setTableHeaders] = useState([...headers]);
  const [tableData, setTableData] = useState(data);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeHeaderValue, setActiveHeaderValue] = useState('');
  const [activeHeaderIndex, setActiveHeaderIndex] = useState(0);

  const checkUniqueColumn = (index, value) => {
    const isHeaderExists = tableHeaders.findIndex(header => header === value);
    if (isHeaderExists === index) {
      return;
    }
    if (isHeaderExists !== -1) {
      setActiveHeaderValue(value);
      setActiveHeaderIndex(index);
      setIsModalVisible(true);
      return;
    }
    editHeaderTitle(index, value);
    setIsModalVisible(false);
  }

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
    console.log(editedData)
    return editedData;
  }

  const addColumn = () => {
    setTableHeaders([...tableHeaders, `Column ${tableHeaders.length + 1}`]);
  };

  const addRow = () => {
    let newRow = {};
    tableHeaders.forEach(header => {
      newRow[header] = '';
    })
    setTableData([...tableData, newRow])
  }

  const editHeaderTitle = (index, value) => {
    const newHeaders = [...tableHeaders];
    newHeaders[index] = value;
    setTableHeaders([...newHeaders]);
    const headerToEdit = tableHeaders[index];
    const newTableData = JSON.parse(JSON.stringify(tableData));
    newTableData.forEach(item => {
      item[value] = item[headerToEdit];
      delete item[headerToEdit];
    })
    setTableData(newTableData);
  }

  return (
    <div className={style.container}>
      <button 
        type="button" 
        onClick={addColumn} 
        className={style.addButton}
      >
          +
      </button>
      <div className={style.wrapper}>
        <table className={style.table} cellSpacing="0">
          <Header 
            tableHeaders={tableHeaders} 
            checkUniqueColumn={checkUniqueColumn} 
            addColumn={addColumn}
          />
          <Body 
            tableData={tableData}
            editCeil={editCeil}
            tableHeaders={tableHeaders}
            emptyCeil={emptyCeil}
          />
        </table>
      </div>
      <div className={style.buttonWrapper}>
        <button 
          className={style.addRowButton}
          onClick={addRow}
        >
          Add row
        </button>
      </div>
      {/* <button type='button' onClick={sendData}>Send data to user</button> */}
      {
        isModalVisible && (
          <Modal 
            index={activeHeaderIndex}
            headerValue={activeHeaderValue} 
            checkUniqueColumn={checkUniqueColumn}
          />
        )
      }
    </div>
  )
}
import React from 'react';
import styles from './App.module.scss';
import { Table } from './Table/Table';

// can you add our eslint, stylelint, prettier?
// https://github.com/Halo-Lab/prettier-config-halo-lab
// https://github.com/Halo-Lab/stylelint-config-halo-lab
// https://github.com/Halo-Lab/eslint-config-halo-lab - I can see this one in devDependencies, but I you also need to add config file, see the documentation

function App() {

  // I think headers and data should be in the same array, so it'll be clear that they're connected
  // const tableColumns = [{
  //   header: 'name',
  //   data: ['adidas', 'nike', 'puma', 'reebok']
  // },{
  //   header: 'second',
  //   data: [21, 22, 23, 24]
  // },{
  //   header: 'third',
  //   data: [31, 32, 33]
  // },
  // {
  //   header: 'fourth',
  //   data: [, 42, 43, 44]
  // }]


  const headers = ['name', 'second', 'third', 'fourth'];
  const data = [
    { name: 'adidas', second: 21, third: 31 },
    { name: 'nike', second: 22, third: 32, fourth: 42 },
    { name: 'puma', second: 23, third: 33, fourth: 43 },
    { name: 'reebok', second: 24, fourth: 44 },
  ];

  // typo Ceil -> Cell
  const emptyCeil = '';

  // I think it'll be better to let users to override styles in CSS by classnames
  const styleObj = {
    addColumnButton: {
      backgroundColor: '#000',
      border: 'none',
      width: '24px',
      height: '24px',
      top: '3px',
      right: '2px',
      color: 'white',
      zIndex: 3
    },
  };

  const onCeilEdit = (data) => {
    console.log(data, 90)
  }

  const onCeilBlur = (data) => {
    console.log('blur', data)
  }

  const onHeaderBlur = (data) => {
    console.log(data)
  }

  const onHeaderEdit = (data) => {
    console.log(data)
  }
  
  return (
    // do we need styles.btn here? 
    <div className={styles.btn}>
      <Table 
        headers={headers} 
        data={data} 
        emptyCeil={emptyCeil} 
        styleObj={styleObj} 
        onCeilEdit={onCeilEdit}
        onCeilBlur={onCeilBlur}
        onHeaderBlur={onHeaderBlur}
        onHeaderEdit={onHeaderEdit}
      />
    </div>
  );
}

export default App;

//detect styleObj.addButton on is it function or number 
// styleobj.addButton key is number - error
//add pagination
//add sorting
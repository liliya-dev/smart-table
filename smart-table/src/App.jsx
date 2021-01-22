import React from 'react';
import styles from './App.module.scss';
import { Table } from './Table/Table';

function App() {
  const headers = [
    { id: 'first', text: 'first' },
    { id: 'second', text: 'second' },
    { id: 'third', text: 'third' },
    { id: 'fourth', text: 'fourth' }
  ];
  const data = [
    { first: 1, second: 21, third: 31 },
    { first: 2, second: 22, third: 32, fourth: 42 },
    { first: 3, second: 23, third: 33, fourth: 43 },
    { first: 4, second: 24, fourth: 44 },
  ];
  const emptyCeil = '';

  return (
    <div className={styles.btn}>
      <Table headers={headers} data={data} emptyCeil={emptyCeil} />
    </div>
  );
}

export default App;

'use client'
import { useEffect, useState } from 'react';

export default function TestBE() {
  const [data, setData] = useState('Loading...');

  console.log(process.env.NEXT_PUBLIC_API_ENDPOINT);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}`)
      .then(res => res.text())
      .then(setData)
      .catch(err => setData(err.message));
  }, []);

  return <div>Backend says: {data}</div>;
}

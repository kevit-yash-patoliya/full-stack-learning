import './App.css'
import { useDispatch, useSelector } from 'react-redux'
import { add, fetchUsers } from './redux/slice';
import { useEffect } from 'react';

function App() {
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(fetchUsers())
  },[])
  const name = useSelector((state) => state.sliceDemo);
  return (
    <>
      <h1>{JSON.stringify(name)}</h1>
      <button onClick={() => dispatch(add({ name: "prit" }))}>click</button>
    </>
  )
}

export default App

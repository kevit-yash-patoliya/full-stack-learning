import { useEffect, useState } from "react";

export default function App() {
  const [users, setUsers] = useState([1, 2, 3, 4, 5]);
  useEffect(() => {
    setUsers((prev) => [...prev, 6, 7, 8, 9, 0]);
  }, []);
 
  return <h1>{users.join(', ')}</h1>;
}
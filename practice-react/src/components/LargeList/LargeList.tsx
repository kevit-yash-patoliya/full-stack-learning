import { useEffect, useState } from "react"
import 'react-virtualized/styles.css'; 
import {List} from 'react-virtualized'
export default function LargeList(){
    const [users,setUsers] = useState([])
    useEffect(() => {
        const worker = new Worker(new URL("../../workers/getLargeList.js", 
            import.meta.url),
            {type:"module"})
        worker.postMessage("getLargeList")
        worker.onmessage = (e) => {
            setUsers(e.data)
        }
    }, [])
    
    const rowRenderer = ({index,style})=>{
        return (
            <h1 style={style} key={index}>{users[index]?.firstName}{' '}{users[index]?.maidenName}{' '}{users[index]?.lastName} { ' ' }{index}</h1>
        )
    }
    return (
        <div>
            <h1>LargeList</h1>
            <List 
            rowCount={users.length} 
            rowHeight={50}
            width={350}
            height={600}
            rowRenderer={rowRenderer}
            />
        </div>
    )
}
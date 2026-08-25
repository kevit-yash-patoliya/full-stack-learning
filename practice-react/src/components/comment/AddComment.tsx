import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useDispatch, useSelector } from "react-redux"
import { addComment } from "../../redux/slices/commentSlice"
import { useCallback, useState } from "react"
import type { RootState } from "../../redux/store"
export function AddComment() {
    const [comment,setComment] = useState("")
    const dispatch = useDispatch()
    const handleAddComment = useCallback(() => {
        dispatch(addComment(comment.trim()))
        setComment("")
    },[comment,dispatch])

    const state = useSelector((state: RootState) => state.comments)
    return (
        <div>
            <div className="grid w-full gap-2">
                <Textarea placeholder="Type your message here." value={comment} onChange={(e)=>setComment(e.target.value)}/>
                <Button onClick={handleAddComment}>Comment</Button>
            </div>
            {
                state.comments.map((comment)=>{
                    return <div>
                        <h1>{comment}</h1>
                    </div>
                })
            }
        </div>
    )
}
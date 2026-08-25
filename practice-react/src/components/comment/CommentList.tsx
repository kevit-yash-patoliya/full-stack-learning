import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { CommentItem } from "./CommentItem"
import { useMemo } from "react"

export function CommentList() {
    console.log("CommentList rendered") // 👈 this will fire on every add (expected)
    const comments = useSelector((state: RootState) => state.comments.comments)
    const commentsLength = useMemo(()=>{
        return comments.length
    },[comments])
    return (
        <div>
            <h1>Total comments: {commentsLength}</h1>
            {comments.map((comment, index) => (
                <CommentItem key={index} comment={comment} />
            ))}
        </div>
    )
}

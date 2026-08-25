# This will get optimize now

```
import { memo } from "react"

// React.memo wraps this component — it will only re-render
// if the `comment` prop actually changes (shallow comparison).
export const CommentItem = memo(function CommentItem({ comment }: { comment: string }) {
    console.log("CommentItem rendered:", comment) // 👈 watch this in console
    return (
        <div>
            <h1>{comment}</h1>
        </div>
    )
})
```

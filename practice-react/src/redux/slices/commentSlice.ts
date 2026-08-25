import { createSlice } from "@reduxjs/toolkit";
import type { CommentState } from "../../types/comment.type";

const slice = createSlice({
    name:"comment-slice",
    initialState:{
        comments:[]
    } as CommentState,
    reducers:{
        addComment:(state,action)=>{
            state.comments.push(action.payload)
        }
    }
})
export const {addComment} = slice.actions
export default slice.reducer
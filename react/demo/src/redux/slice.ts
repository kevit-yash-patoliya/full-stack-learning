import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchUsers = createAsyncThunk("fetchUser",async (_,rejectWithValue)=>{
    try{
        const res = await fetch("https://6a5dbb800ad09982aef75bf6.mockapi.io/Users")
        console.log(res)
        return res.json();
    }catch(e:any){
        return rejectWithValue(e.response ? e.response.data:"Network Error")
    }   
})


export const slice = createSlice({
    name:"slice",
    initialState:{
        "name":"yash"
    },
    reducers:{
        add:(state,action)=>{
            state.name = action.payload.name
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchUsers.fulfilled,(state,action)=>{
            return {...state,res :action.payload}
        })
    }
}) 


export const reducer = slice.reducer;
export const {add} = slice.actions;
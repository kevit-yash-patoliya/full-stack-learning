import { configureStore } from "@reduxjs/toolkit"
import todoReducer from "./slices/todo.slice"
import commentReducer from "./slices/commentSlice"

export const store = configureStore({
    reducer: { todos: todoReducer , comments:commentReducer}
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
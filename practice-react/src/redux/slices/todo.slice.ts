import { createSlice } from "@reduxjs/toolkit"
import type { TodoState } from "../../types/todo.types"
const todoSlice = createSlice({
    name: 'todo',
    initialState: {
        todos: []
    } as TodoState,
    reducers: {
        addTodo: (state, action) => {
            state.todos.push(action.payload)
        },
        deleteTodo: (state, action) => {
            state.todos = state.todos.filter(todo => todo.id !== action.payload)
        },
        toggleTodo: (state, action) => {
            state.todos = state.todos.map(todo => todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo)
        }
    }
})



export const { addTodo, deleteTodo, toggleTodo } = todoSlice.actions
export default todoSlice.reducer

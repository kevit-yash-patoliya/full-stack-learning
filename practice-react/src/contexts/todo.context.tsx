import { createContext, useState } from "react";
import type { TodoItem, TodoContextType } from "../types/todo.types";

export const TodoContext = createContext<TodoContextType | null>(null)

export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
    const [todos, setTodos] = useState<TodoItem[]>([])

    const addTodo = (title: string, description?: string) => {
        const newTodo: TodoItem = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            description,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        setTodos(prev => [...prev, newTodo])
    }

    const toggleTodo = (id: string) => {
        setTodos(prev =>
            prev.map(todo =>
                todo.id === id
                    ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
                    : todo
            )
        )
    }

    const deleteTodo = (id: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== id))
    }

    return (
        <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
            {children}
        </TodoContext.Provider>
    )
}

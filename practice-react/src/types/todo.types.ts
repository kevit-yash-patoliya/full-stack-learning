export interface TodoItem {
    id: string
    title: string
    description?: string
    completed: boolean
    createdAt: Date
    updatedAt: Date
}

export interface TodoState {
    todos: TodoItem[]
}

export interface TodoContextType {
    todos: TodoItem[]
    addTodo: (title: string, description?: string) => void
    toggleTodo: (id: string) => void
    deleteTodo: (id: string) => void
}
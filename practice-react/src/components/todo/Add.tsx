import { useState } from "react";
import { useDispatch } from "react-redux";
import { addTodo } from "../../redux/slices/todo.slice";

export function AddTodo() {
    const [title, setTitle] = useState("")
    const dispatch = useDispatch()
    const handleAdd = () => {
        if (title.trim() === "") return
        dispatch(addTodo({
            id: Math.random().toString(),
            title: title.trim(),
            description: "",
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }))
        setTitle("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAdd()
    }

    return (
        <div className="flex gap-3">
            <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-transparent text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
            />
            <button
                onClick={handleAdd}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
                Add
            </button>
        </div>
    )
}
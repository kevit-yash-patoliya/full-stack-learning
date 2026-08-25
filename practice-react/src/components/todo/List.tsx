import { useDispatch, useSelector } from "react-redux";
import { toggleTodo, deleteTodo } from "../../redux/slices/todo.slice";
import type { TodoState } from "../../types/todo.types";
import type { RootState } from "../../redux/store";

export function TodoList() {
    const todosState: TodoState = useSelector((state: RootState) => state.todos)
    const dispatch = useDispatch()
    console.info(todosState.todos, 'all todos')
    if (!!todosState.todos && todosState.todos.length === 0) {
        return (
            <p className="text-gray-500 text-center py-8">
                No todos yet. Add one above!
            </p>
        )
    }

    return (
        <ul className="flex flex-col gap-2">
            {todosState && todosState.todos.map((todo) => (
                <li
                    key={todo.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 bg-gray-900/50 group hover:border-gray-600 transition-colors"
                >
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => dispatch(toggleTodo(todo.id))}
                        className="w-5 h-5 accent-purple-500 cursor-pointer"
                    />
                    <span
                        className={`flex-1 ${
                            todo.completed
                                ? "line-through text-gray-500"
                                : "text-white"
                        }`}
                    >
                        {todo.title}
                    </span>
                    <button
                        onClick={() => dispatch(deleteTodo(todo.id))}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity cursor-pointer"
                    >
                        ✕
                    </button>
                </li>
            ))}
        </ul>
    )
}

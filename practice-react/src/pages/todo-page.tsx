import { AddComment } from "../components/comment/AddComment";
import LargeList from "../components/LargeList/LargeList";
import { ThemeToggle } from "../components/ThemeToggle";
import { AddTodo } from "../components/todo/Add";
import { TodoList } from "../components/todo/List";

export function TodoPage() {
    return (
        <div className="max-w-xl mx-auto py-10 px-4 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Todo List</h1>
                <ThemeToggle />
            </div>
            <AddTodo />
            <TodoList />

            <AddComment/>
            <LargeList/>
        </div>
    )
}

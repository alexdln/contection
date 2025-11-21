import { createStore } from "contection";
import { StorageAdapter } from "contection-storage-adapter";

export interface TodoItem {
    id: string;
    title: string;
    description: string;
    createdAt: number;
    updatedAt: number;
}

export interface TodoStore {
    userName: string;
    list: TodoItem[];
    currentTodoId: string | null;
    lastVisited: string | null;
}

export const ToDoStore = createStore<TodoStore>(
    {
        userName: "User",
        list: [
            {
                id: `todo-${Date.now()}`,
                title: "Welcome!",
                description: "This is a sample todo item. You can edit or delete it.",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ],
        currentTodoId: null,
        lastVisited: null,
    },
    {
        adapter: new StorageAdapter<TodoStore>({
            prefix: "todo-store-",
            enabled: "always",
            storage: "localStorage",
        }),
    },
);

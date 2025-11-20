import { createStore } from "contection";

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
        list: [],
        currentTodoId: null,
        lastVisited: null,
    },
    {
        lifecycleHooks: {
            storeWillMount: (_store, setStore) => {
                // Initialize with a sample todo if list is empty
                const sampleTodo: TodoItem = {
                    id: `todo-${Date.now()}`,
                    title: "Welcome!",
                    description: "This is a sample todo item. You can edit or delete it.",
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                setStore({
                    list: [sampleTodo],
                    lastVisited: sampleTodo.id,
                });
            },
        },
    },
);

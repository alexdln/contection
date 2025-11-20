import { TodoItem } from "../../../stores/todo-store";

export const createNewItem = (): TodoItem => ({
    id: `todo-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    title: "",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
});

import { useStore, useStoreReducer } from "contection";
import { useRef } from "react";

import { ToDoStore, TodoItem } from "../../../stores/todo-store";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { createNewItem } from "./create-new-item";

import "./styles.scss";
import { RenderTracker } from "../../ui/render-tracker";

export const TodoForm: React.FC = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [, setStore] = useStoreReducer(ToDoStore);
    const { store, index } = useStore(ToDoStore, {
        keys: ["list", "currentTodoId"],
        mutation: (store) => {
            const index = store.list.findIndex((item) => item.id === store.currentTodoId);
            if (index === -1) return { store: null, index: store.list.length };
            return {
                store: store.list[index],
                index,
            };
        },
    });

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;

        const newTodo: TodoItem = {
            id: `todo-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            title: title,
            description: description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setStore((prev) => ({
            list: [...prev.list, newTodo],
            lastVisited: newTodo.id,
        }));
        e.currentTarget.reset();
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setStore({ currentTodoId: null });
        e.currentTarget.reset();
    };

    const handleCancel = () => {
        setStore({ currentTodoId: null });
        formRef.current?.reset();
    };

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setStore((prev) => {
            const newList = [...prev.list];
            newList[index] ||= createNewItem();
            newList[index] = {
                ...newList[index],
                [e.target.name]: e.target.value,
                updatedAt: Date.now(),
            };
            return {
                ...prev,
                list: newList,
            };
        });
    };

    return (
        <RenderTracker path="/components/demos/todo/todo-form.tsx" color="#ef4444">
            <Card
                title={store ? "Edit Todo" : "Add New Todo"}
                description={store ? "Update the todo item" : "Create a new todo item"}
            >
                <form ref={formRef} onSubmit={store ? handleUpdate : handleAdd} className="demo-todo__form-content">
                    <div className="demo-todo__form-field">
                        <label htmlFor="todo-title">Title</label>
                        <input
                            id="todo-title"
                            type="text"
                            name="title"
                            {...(store
                                ? {
                                      value: store.title,
                                      onChange: changeHandler,
                                  }
                                : {
                                      defaultValue: "",
                                  })}
                            placeholder="My next task is..."
                            required
                        />
                    </div>
                    <div className="demo-todo__form-field">
                        <label htmlFor="todo-description">Description</label>
                        <textarea
                            id="todo-description"
                            name="description"
                            {...(store
                                ? {
                                      value: store.description,
                                      onChange: changeHandler,
                                  }
                                : {
                                      defaultValue: "",
                                  })}
                            placeholder="I need to ... to achieve my goal"
                            rows={4}
                        />
                    </div>
                    <div className="demo-todo__form-actions">
                        <Button type="submit" variant="primary">
                            {store ? "Finish Editing" : "Add Todo"}
                        </Button>
                        {store && (
                            <Button type="button" onClick={handleCancel} variant="secondary">
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Card>
        </RenderTracker>
    );
};

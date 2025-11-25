import { useStore, useStoreReducer } from "contection";
import { memo } from "react";

import { ToDoStore } from "../../../stores/todo-store";
import { RenderTracker } from "../../ui/render-tracker";
import { Button } from "../../ui/button";

import "./styles.scss";

interface TodoItemComponentProps {
    id: string;
}

export const TodoItemComponent: React.FC<TodoItemComponentProps> = memo(({ id }) => {
    const [, setStore] = useStoreReducer(ToDoStore);
    const item = useStore(ToDoStore, {
        keys: ["list"],
        mutation: (store) => store.list.find((item) => item.id === id),
    });
    if (!item) {
        return null;
    }

    const editHandler = () => {
        setStore({ currentTodoId: id });
    };
    const deleteHandler = () => {
        setStore((prev) => ({
            list: prev.list.filter((item) => item.id !== id),
            lastVisited: prev.lastVisited === id ? (prev.list.length > 1 ? prev.list[0].id : null) : prev.lastVisited,
        }));
    };

    return (
        <RenderTracker path="/components/demos/todo/todo-item-component.tsx" color="#10b981">
            <div className="demo-todo__item">
                <div className="demo-todo__item-content">
                    <h4 className="demo-todo__item-title">{item.title}</h4>
                    <p className="demo-todo__item-description">{item.description}</p>
                    <div className="demo-todo__item-meta">
                        <span className="demo-todo__item-date">
                            Created: {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <span className="demo-todo__item-date">
                            Updated: {new Date(item.updatedAt).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="demo-todo__item-actions">
                    <Button onClick={editHandler} variant="secondary" className="demo-todo__item-button">
                        Edit
                    </Button>
                    <Button onClick={deleteHandler} variant="secondary" className="demo-todo__item-button">
                        Delete
                    </Button>
                </div>
            </div>
        </RenderTracker>
    );
});

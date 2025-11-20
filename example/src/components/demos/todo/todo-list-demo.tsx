import { useStoreReducer } from "contection";

import { ToDoStore } from "../../../stores/todo-store";
import { RenderTracker } from "../../ui/render-tracker";
import { TodoItemComponent } from "./todo-item-component";
import { TodoForm } from "./todo-form";

import "./styles.scss";

export const TodoListDemo: React.FC = () => {
    const [store] = useStoreReducer(ToDoStore);

    return (
        <div className="demo-todo">
            <div className="demo-todo__container">
                <div className="demo-todo__list">
                    <ToDoStore.Consumer options={{ keys: ["list"], mutation: (store) => store.list.length }}>
                        {(listLength) => (
                            <RenderTracker path="/components/demos/todo/todo-list-demo.tsx" color="#ed7fb7">
                                <h3 className="demo-todo__list-title">Todo Items</h3>
                                <div className="demo-todo__items">
                                    {listLength === 0 ? (
                                        <div className="demo-todo__empty">No todos yet. Add one to get started!</div>
                                    ) : (
                                        store.list.map((item) => <TodoItemComponent key={item.id} id={item.id} />)
                                    )}
                                </div>
                            </RenderTracker>
                        )}
                    </ToDoStore.Consumer>
                </div>

                <div className="demo-todo__form">
                    <TodoForm />
                </div>
            </div>
        </div>
    );
};

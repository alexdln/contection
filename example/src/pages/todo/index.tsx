import { TodoListDemo } from "../../components/demos/todo";
import { RenderTracker } from "../../components/ui/render-tracker";

import "./styles.scss";

export const TodoPage: React.FC = () => {
    return (
        <RenderTracker path="/pages/todo/index.tsx" color="#ef4444">
            <div className="page-todo">
                <TodoListDemo />
            </div>
        </RenderTracker>
    );
};

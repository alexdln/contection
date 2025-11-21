import { TodoListDemo } from "../../components/demos/todo";
import { InfoBanner } from "../../components/ui/info-banner";
import { RenderTracker } from "../../components/ui/render-tracker";

import "./styles.scss";

export const TodoPage: React.FC = () => {
    return (
        <RenderTracker path="/pages/todo/index.tsx" color="#ef4444">
            <div className="page-todo">
                <InfoBanner>
                    <div>
                        <a href="https://www.npmjs.com/package/contection" target="_blank" rel="noopener noreferrer">
                            npm
                        </a>
                        {" • "}
                        <code>npm install contection</code>
                    </div>
                    <br />
                    <p>This page uses contection-storage-adapter to save the todo list to localStorage</p>
                </InfoBanner>
                <TodoListDemo />
            </div>
        </RenderTracker>
    );
};

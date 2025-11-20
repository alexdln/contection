import { AppStore } from "./stores/app-store";
import { ViewportStore } from "./stores/viewport-store";
import { TopLayerStore } from "./stores/top-layer-store";
import { ToDoStore } from "./stores/todo-store";
import { ContectionPage } from "./pages/contection";
import { ViewportPage } from "./pages/viewport";
import { TopLayerPage } from "./pages/top-layer";
import { TodoPage } from "./pages/todo";
import { Navigation, NavigationTab } from "./components/ui/navigation";
import { GlobalBackdrop } from "./components/ui/global-backdrop";
import { OverflowBlocker } from "./components/ui/overflow-blocker";
import { UpperLayerDemo } from "./components/demos/top-layer";
import { Layout } from "./components/ui/layout";

function App() {
    return (
        <AppStore>
            <ViewportStore>
                <TopLayerStore>
                    <ToDoStore>
                        <Navigation />
                        <Layout>
                            <NavigationTab tab="todo">
                                <TodoPage />
                            </NavigationTab>
                            <NavigationTab tab="contection">
                                <ContectionPage />
                            </NavigationTab>
                            <NavigationTab tab="viewport">
                                <ViewportPage />
                            </NavigationTab>
                            <NavigationTab tab="top-layer">
                                <TopLayerPage />
                            </NavigationTab>
                            <GlobalBackdrop />
                            <OverflowBlocker />
                            <UpperLayerDemo />
                        </Layout>
                    </ToDoStore>
                </TopLayerStore>
            </ViewportStore>
        </AppStore>
    );
}

export default App;

import Link from "next/link";
import { CodeBlock } from "robindoc/lib/components/ui/code-block";

import "./home.scss";

export default function Home() {
    return (
        <main className="home r-container">
            <section className="hero">
                <h1>Contection</h1>
                <p className="tagline">
                    React Context API extended with fine-grained subscriptions and computed values
                </p>
                <div className="hero-actions">
                    <Link href="/docs" className="btn-primary">
                        Get Started
                    </Link>
                    <Link href="/demo" className="btn-secondary">
                        Live Demo
                    </Link>
                </div>
            </section>

            <section className="features">
                <div className="feature">
                    <h3>Granular Subscriptions</h3>
                    <p>Subscribe to specific store keys — components re-render only when subscribed data changes</p>
                </div>
                <div className="feature">
                    <h3>Computed Values</h3>
                    <p>Derive state with mutation functions for transformed or filtered data</p>
                </div>
                <div className="feature">
                    <h3>SSR Compatible</h3>
                    <p>Works with Next.js and other SSR frameworks out of the box</p>
                </div>
            </section>

            <section className="example">
                <CodeBlock
                    code={`import { createStore, useStore } from "contection";

const AppStore = createStore({ count: 0, user: "Alex" });

function Counter() {
    const { count } = useStore(AppStore, { keys: ["count"] });
    return <span>{count}</span>;
}`}
                    lang="typescript"
                />
            </section>

            <section className="links">
                <a href="https://www.npmjs.com/package/contection" target="_blank" rel="noopener noreferrer">
                    NPM
                </a>
                <a href="https://github.com/alexdln/contection" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
            </section>
        </main>
    );
}

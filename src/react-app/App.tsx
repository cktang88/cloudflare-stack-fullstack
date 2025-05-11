// src/App.tsx

import { Link, Route, Switch } from "wouter";
import { TodoPage } from "./features/todos/TodoPage";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useUserName } from "./hooks/useUserName";
import { UserNameModal } from "./components/UserNameModal";
import "./App.css"; // Assuming this has some base styles or can be removed if Tailwind handles everything

function App() {
  const { userName, setUserName, isModalOpen, setIsModalOpen, clearUserName } =
    useUserName();

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="container mx-auto py-4">
        <nav className="flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              Cloudflare Todo App
            </a>
          </Link>
          {userName && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Hi, {userName}!
              </span>
              <Button variant="outline" size="sm" onClick={clearUserName}>
                Change Name
              </Button>
            </div>
          )}
        </nav>
      </header>

      <main>
        <Switch>
          <Route
            path="/"
            component={() => <TodoPage currentUserName={userName} />}
          />
          {/* Example of another route */}
          {/* <Route path="/about">
            <div className="container mx-auto py-4">
              <h1 className="text-2xl">About Page</h1>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </Route> */}
          <Route>
            <div className="container mx-auto py-4 text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </Route>
        </Switch>
      </main>

      <footer className="container mx-auto py-4 mt-8 text-center text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Todo App Inc. Built with Cloudflare.
        </p>
      </footer>
      <Toaster richColors />
      <UserNameModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onNameSubmit={setUserName}
      />
    </div>
  );
}

export default App;

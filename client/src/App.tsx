import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import VHSGlitch from "./components/VHSGlitch";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogAdmin from "./pages/BlogAdmin";
import KnowledgeAdmin from "./pages/KnowledgeAdmin";
import Zoltar from "./components/Zoltar";

/* Design Philosophy: Neon Apocalypse - Cyberpunk Metal Fusion
 * Dark theme with electric cyan, magenta, and toxic green neon accents
 * Aggressive angular layouts with diagonal cuts and glitch effects
 */
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/project/:slug"} component={ProjectDetail} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/admin/blog"} component={BlogAdmin} />
      <Route path={"/admin/knowledge"} component={KnowledgeAdmin} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <VHSGlitch />
          <Router />
          <Zoltar />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

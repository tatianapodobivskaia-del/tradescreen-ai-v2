import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Screening from "./pages/Screening";
import LiveDemo from "./pages/LiveDemo";
import Watchlist from "./pages/Watchlist";
import CyrillicEngine from "./pages/CyrillicEngine";
import DocumentScanner from "./pages/DocumentScanner";
import Reports from "./pages/Reports";
import AuditLog from "./pages/AuditLog";
import Architecture from "./pages/Architecture";
import AboutResearcher from "./pages/AboutResearcher";
import SettingsPage from "./pages/Settings";
import LegalPages from "./pages/LegalPages";
import AppLayout from "./components/AppLayout";
import { useLocation } from "wouter";

function AppPages() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/app" component={Dashboard} />
        <Route path="/app/screening" component={Screening} />
        <Route path="/app/live-demo" component={LiveDemo} />
        <Route path="/app/watchlist" component={Watchlist} />
        <Route path="/app/cyrillic" component={CyrillicEngine} />
        <Route path="/app/scanner" component={DocumentScanner} />
        <Route path="/app/reports" component={Reports} />
        <Route path="/app/audit" component={AuditLog} />
        <Route path="/app/architecture" component={Architecture} />
        <Route path="/app/about" component={AboutResearcher} />
        <Route path="/app/settings" component={SettingsPage} />
        <Route path="/app/disclaimer" component={LegalPages} />
        <Route path="/app/privacy" component={LegalPages} />
        <Route path="/app/terms" component={LegalPages} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const [location] = useLocation();
  const isAppRoute = location.startsWith("/app");

  if (isAppRoute) {
    return <AppPages />;
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

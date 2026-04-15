import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RecordingsProvider } from "@/stores/recordings";
import { PlaybackProvider } from "@/hooks/use-playback";
import BottomNav from "@/components/layout/BottomNav";
import Home from "./pages/Home";
import Capture from "./pages/Capture";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Recordings from "./pages/Recordings";
import RecordingDetail from "./pages/RecordingDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RecordingsProvider>
      <PlaybackProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="mx-auto max-w-lg">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/capture" element={<Capture />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/recordings" element={<Recordings />} />
              <Route path="/recordings/:id" element={<RecordingDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </RecordingsProvider>
  </QueryClientProvider>
);

export default App;

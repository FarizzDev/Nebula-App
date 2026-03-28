import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { ToastProvider } from "./components/UI";
import Dashboard from "./pages/Dashboard";
import Materi from "./pages/Materi";
import MateriDetail from "./pages/MateriDetail";
import Soal from "./pages/Soal";
import Chat from "./pages/Chat";
import Reminder from "./pages/Reminder";
import Settings from "./pages/Settings";
import Stars from "./components/Stars";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Stars />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="materi" element={<Materi />} />
            <Route path="materi/:id" element={<MateriDetail />} />
            <Route path="soal" element={<Soal />} />
            <Route path="chat" element={<Chat />} />
            <Route path="reminder" element={<Reminder />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

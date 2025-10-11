import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookingPage from "@/pages/BookingPage";
import AdminPage from "@/pages/AdminPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
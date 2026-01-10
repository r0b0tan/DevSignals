import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Compare view is now integrated into HomePage/Dashboard */}
      </Routes>
    </BrowserRouter>
  );
}

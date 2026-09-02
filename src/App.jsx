import { Routes, Route, Navigate } from 'react-router-dom';
import TokenEntry from './pages/TokenEntry';
import StallDisplay from './pages/StallDisplay';
import AdminOrders from './pages/AdminOrders';
import AdminHandover from './pages/AdminHandover';
import CustomerStatus from './pages/CustomerStatus';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TokenEntry />} />
      <Route path="/display" element={<StallDisplay />} />
      <Route path="/admin" element={<AdminOrders />} />
      <Route path="/handover" element={<AdminHandover />} />
      <Route path="/status" element={<CustomerStatus />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

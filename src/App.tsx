import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import DashboardOverview from './pages/DashboardOverview';
import Login from './pages/Login';
import RoomsManagement from './pages/RoomsManagement';
import StaffManagement from './pages/StaffManagement';
import ActivitiesManagement from './pages/ActivitiesManagement';
import TripHistory from './pages/TripHistory';
import TripDetails from './pages/TripDetails';
import CreateCruise from './pages/CreateCruise';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomeLoader />} />
          <Route path="/login" element={<Login />} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/trips" element={<TripHistory />} />
            <Route path="/cruises/:id" element={<TripDetails />} />
            <Route path="/rooms" element={<RoomsManagement />} />
            <Route path="/activities" element={<ActivitiesManagement />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/create-cruise" element={<CreateCruise />} />
            <Route path="/alerts" element={<Placeholder title="Alerts" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Separate component for the Landing page logic requested by the user
const HomeLoader = () => {
  // If we want to keep the landing page:
  return (
    <div id="hero" className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <h1 className="text-7xl font-black tracking-tighter z-10 text-center mb-10 leading-none">OUR CRUISE<br />OUR PRIDE</h1>
      <a
        href='/login'
        className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-black hover:text-white border-2 border-white transition-all z-10 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
      >
        Manage Cruise
      </a>

      <div id="video" className="absolute inset-0 opacity-40 grayscale pointer-events-none">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="https://media.istockphoto.com/id/1151603515/video/aerial-view-of-luxury-cruise-ship-sailing-to-port.mp4?s=mp4-640x640-is&k=20&c=p71XfXv1pXBv1v71T1X_9xL8z_v1I_v1I_v1I_v1I=" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white border border-gray-100 p-20 rounded-3xl shadow-sm text-center">
    <h1 className="text-4xl font-black tracking-tight mb-4">{title}</h1>
    <p className="text-gray-400 font-medium">Developing this module for you...</p>
  </div>
);

export default App;

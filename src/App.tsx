
import cruiseVideo from './assets/cruise1.mp4';
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
import GenerateTrip from './pages/GenerateTrip';
import AddTripArchive from './pages/AddTripArchive';
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
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/create-cruise" element={<CreateCruise />} />
            <Route path="/generate-trip" element={<GenerateTrip />} />
            <Route path="/add-trip-archive" element={<AddTripArchive />} />
            <Route path="/alerts" element={<Placeholder title="Alerts" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


const HomeLoader = () => {

  return (
    <div id="hero" className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <h1 className="text-7xl font-black tracking-tighter z-10 text-center mb-10 leading-none">OUR CRUISE<br />OUR PRIDE</h1>
      <a
        href='/login'
        className="px-10 py-5 text-black font-black uppercase tracking-widest hover:bg-white border-2 border-white transition-all z-10 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
      >
        Manage Cruise
      </a>

      <div id="video" className="absolute inset-0 opacity-40 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={cruiseVideo} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-20 rounded-3xl shadow-sm text-center">
    <h1 className="text-4xl font-black tracking-tight mb-4 text-[#e5e5e5]">{title}</h1>
    <p className="text-[#a0a0a0] font-medium">Developing this module for you...</p>
  </div>
);

export default App;

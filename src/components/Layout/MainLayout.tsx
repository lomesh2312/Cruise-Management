import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
    const { token, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-[#1a1a1a]">
            <div className="w-8 h-8 border-4 border-[#b8935e] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

    return (
        <div className="flex min-h-screen bg-[#1a1a1a] transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-8 pt-2">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

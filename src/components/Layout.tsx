import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    title,
    showBackButton = true,
    showHomeButton = true
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        navigate(-1);
    };

    const handleHome = () => {
        navigate('/dashboard');
    };

    const isDashboard = location.pathname === '/dashboard';

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Navigation Header */}
            {!isDashboard && (showBackButton || showHomeButton) && (
                <div className="bg-white border-b border-stone-200">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {showBackButton && (
                                    <button
                                        onClick={handleBack}
                                        className="flex items-center space-x-2 px-3 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span className="text-sm font-medium">Back</span>
                                    </button>
                                )}

                                {showHomeButton && (
                                    <button
                                        onClick={handleHome}
                                        className="flex items-center space-x-2 px-3 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                                    >
                                        <Home className="w-4 h-4" />
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </button>
                                )}
                            </div>

                            {title && (
                                <h1 className="text-lg font-semibold text-stone-800">{title}</h1>
                            )}

                            <div className="w-32"></div> {/* Spacer for centering */}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
};

export default Layout;

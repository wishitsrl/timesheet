import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthSession } from './authContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
	const { user, isLoading } = useAuthSession();

if (isLoading) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <span>Caricamento...</span>
        </div>
    );
}


	if (!user) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

export default PrivateRoute;

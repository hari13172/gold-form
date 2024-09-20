// ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// The ProtectedRoute component to protect routes
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // If the user is not authenticated, redirect to the sign-in page
        return <Navigate to="/signin" />;
    }

    // If authenticated, render the children (protected route)
    return <>{children}</>;
};

export default ProtectedRoute;

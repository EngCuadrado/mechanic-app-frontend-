import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
	allowedRoles?: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
	const { isAuthenticated, user } = useAuth();

	if (!isAuthenticated) {
		// Si no está autenticado, redirige a la página de login
		return <Navigate to="/signin" replace />;
	}

	// Si se especificaron roles permitidos y el usuario no tiene uno de ellos
	if (allowedRoles && user && !allowedRoles.includes(user.roleId)) {
		// Redirige al home o a una página de "No autorizado"
		return <Navigate to="/home" replace />;
	}

	// Si está autenticado y tiene rol permitido (si aplica), renderiza el componente hijo
	return <Outlet />;
};

export default ProtectedRoute;

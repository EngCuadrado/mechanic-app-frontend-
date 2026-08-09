import axios from "axios";
import React, {
	createContext,
	useState,
	useContext,
	ReactNode,
	useEffect,
} from "react";

const baseUrl = import.meta.env.VITE_BASE_API_URL;

// Define la forma de los datos del usuario que vienen en el token/response
interface UserData {
	employeeId: number;
	names: string;
	lastnames: string;
	username: string;
	roleName: string;
	roleId: number;
}

// Define la forma de la respuesta completa de la API
interface ApiResponse {
	success: boolean;
	message: string | null;
	data: {
		token: string;
		expiresAt: string;
	} & UserData; // Combinamos UserData aquí
}

// Define lo que expondrá nuestro Context
interface AuthContextType {
	isAuthenticated: boolean;
	user: UserData | null;
	token: string | null;
	login: (user: string, password: string) => Promise<void>;
	logout: () => void;
}

// Creamos el Context con un valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del Provider
interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<UserData | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	// Efecto para cargar el token desde localStorage al iniciar la app
	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
			setIsAuthenticated(true);
			// Configura axios globalmente al cargar
			axios.defaults.headers.common["Authorization"] =
				`Bearer ${storedToken}`;
		}
	}, []);

	const login = async (username: string, password: string) => {
		try {
			const response = await axios.post<ApiResponse>(
				// 'http://localhost:5036/api/Auth/login',
				// 'https://localhost:44361/api/Auth/login',
				baseUrl + "api/Auth/login",
				{
					user: username,
					password: password,
				},
			);

			if (response.data.success) {
				const { token, ...userData } = response.data.data;

				// 1. Guardar en estado
				setToken(token);
				setUser(userData);
				setIsAuthenticated(true);

				// 2. Guardar en localStorage para persistir la sesión
				localStorage.setItem("token", token);
				localStorage.setItem("user", JSON.stringify(userData));

				// 3. Configurar el header de Authorization para futuras peticiones
				axios.defaults.headers.common["Authorization"] =
					`Bearer ${token}`;
			} else {
				// Manejar error de login (ej. credenciales incorrectas)
				throw new Error(response.data.message || "Error en el login");
			}
		} catch (error) {
			console.error("Error al iniciar sesión:", error);
			// Aquí podrías setear un estado de error para mostrar al usuario
			throw error; // Relanza el error para que el formulario lo maneje
		}
	};

	const logout = () => {
		// 1. Limpiar estado
		setToken(null);
		setUser(null);
		setIsAuthenticated(false);

		// 2. Limpiar localStorage
		localStorage.removeItem("token");
		localStorage.removeItem("user");

		// 3. Limpiar header de axios
		delete axios.defaults.headers.common["Authorization"];
	};

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, user, token, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

// Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth debe ser usado dentro de un AuthProvider");
	}
	return context;
};

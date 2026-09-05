import { Tooltip } from "react-tooltip";
import { IntlProvider } from "react-intl";
import { Fragment } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";

import Blank from "./pages/Blank";
import messages_es from "./lang/es.json";
import Home from "./pages/Dashboard/Home";
import AppLayout from "./layout/AppLayout";
import "react-tooltip/dist/react-tooltip.css";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Catalogs from "./pages/Tables/Catalogs";
import Products from "./pages/Tables/Products";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import BarChart from "./pages/Charts/BarChart";
import UserProfiles from "./pages/UserProfiles";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Sale from "./pages/Sale";

import Inventario from "./pages/Inventario";
import Ventas from "./pages/Ventas";
import Empleados from "./pages/Empleados";
import Reportes from "./pages/Reportes";
import Sales from "./components/ui/catalogs/Sales";
import Inventory from "./pages/Tables/Inventory";

export default function App() {
	const locale = "es-NI";

	return (
		<Fragment>
			<IntlProvider
				locale={locale}
				messages={messages_es}
				defaultLocale="es"
			>
				<Router>
					<ScrollToTop />
					<Routes>
						{/* Dashboard Layout */}
						<Route element={<AppLayout />}>
							<Route
								index
								path="/"
								element={<Navigate to="/signin" replace />}
							/>

							{/* Agrupa todas las rutas protegidas aquí dentro */}
							<Route element={<ProtectedRoute />}>
								{/* PAGINAS PRINCIPALES ACCESIBLES POR TODOS LOS ROLES AUTENTICADOS (DENTRO DE ESTE GRUPO) */}
								<Route path="/home" element={<Home />} />
								<Route path="/calendar" element={<Home />} />
								<Route
									path="/profile"
									element={<UserProfiles />}
								/>
								{/* <Route path="/sales" element={<Sale />} />
								<Route
									path="/transactions"
									element={<Sales />}
								/>
								<Route
									path="/products"
									element={<Products />}
								/> */}

								<Route
									path="/inventory"
									element={<Inventory />}
								/>

								<Route
									path="/catalogs"
									element={<Catalogs />}
								/>

								{/* RUTAS SOLO PARA ROL 1 (ADMIN) */}
								<Route
									element={
										<ProtectedRoute allowedRoles={[1]} />
									}
								>
									<Route
										path="/inventario"
										element={<Inventario />}
									/>
									<Route
										path="/ventas"
										element={<Ventas />}
									/>
									<Route
										path="/empleados"
										element={<Empleados />}
									/>
									<Route
										path="/reportes"
										element={<Reportes />}
									/>

									{/* Tables & UI Elements (Asumiendo que son admin o para desarrollo) */}
									<Route
										path="/basic-tables"
										element={<BasicTables />}
									/>
									<Route
										path="/employee-tables"
										element={<BasicTables />}
									/>
									<Route
										path="/alerts"
										element={<Alerts />}
									/>
									<Route
										path="/avatars"
										element={<Avatars />}
									/>
									<Route path="/badge" element={<Badges />} />
									<Route
										path="/buttons"
										element={<Buttons />}
									/>
									<Route
										path="/images"
										element={<Images />}
									/>
									<Route
										path="/videos"
										element={<Videos />}
									/>
									<Route
										path="/line-chart"
										element={<LineChart />}
									/>
									<Route
										path="/bar-chart"
										element={<BarChart />}
									/>
								</Route>

								<Route path="/blank" element={<Blank />} />
							</Route>
							{/* Fin del grupo de rutas protegidas */}
						</Route>

						{/* Auth Layout (Estas quedan fuera, lo cual es correcto) */}
						<Route path="/signin" element={<SignIn />} />
						<Route path="/signup" element={<SignUp />} />

						{/* Fallback Route */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Router>
				<Tooltip className="z-9999" id="global-tooltip" />
			</IntlProvider>
		</Fragment>
	);
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { CircularProgress } from "@mui/material";
import { debounce } from "../../utils/debounce";

export default function SignInForm() {
	// Inicializa la librería de internacionalización (react-intl) para acceder a los textos localizados.
	const intl = useIntl();

	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();

	const handleLogin = async () => {
		setLoading(true);

		if (!username || !password) {
			toast.error(intl.formatMessage({ id: "error.incompleteParams" }));
			setLoading(false);
			return;
		}

		try {
			await login(username, password);
			navigate("/home");
		} catch (err) {
			// Muestra una notificación de error usando 'sonner' (toast library).
			// Se utiliza intl.formatMessage para obtener el texto de error localizado.
			// Existen 3 versiones de toast -> toast.success | toast.error | toast.warining
			toast.error(intl.formatMessage({ id: "error.login" }));
		} finally {
			setLoading(false);
		}
	};

	// Aplica debounce a la función de login. Esto previene múltiples clics rápidos en el botón de submit.
	// Se ejecutará como máximo una vez cada 500ms.
	const debouncedHandleLogin = debounce(handleLogin, 500);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!loading) {
			debouncedHandleLogin();
		}
	};

	return (
		<div className="flex flex-col flex-1">
			<div className="w-full max-w-md pt-10 mx-auto"></div>
			<div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
				<div>
					<div className="mb-5 sm:mb-8">
						<h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
							<FormattedMessage id="login" />
						</h1>
					</div>

					<div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5"></div>
						<form onSubmit={handleSubmit}>
							<div className="space-y-6">
								<div>
									<Label>
										<FormattedMessage id="user" />
										<span className="text-error-500">
											*
										</span>
									</Label>
									<Input
										onChange={(e) =>
											setUsername(e.target.value)
										}
									/>
								</div>
								<div>
									<Label>
										<FormattedMessage id="password" />
										<span className="text-error-500">
											*
										</span>
									</Label>
									<div className="relative">
										<Input
											type={
												showPassword
													? "text"
													: "password"
											}
											onChange={(e) =>
												setPassword(e.target.value)
											}
										/>
										<span
											onClick={() =>
												setShowPassword(!showPassword)
											}
											className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
										>
											{showPassword ? (
												<EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
											) : (
												<EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
											)}
										</span>
									</div>
								</div>
								<div>
									<button
										type="submit"
										className={`w-full p-2 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-brand-500 hover:bg-brand-600"}`}
										disabled={loading} // Deshabilita el botón mientras la carga está activa.
									>
										{/* Muestra un texto diferente si está cargando */}
										{loading ? (
											<CircularProgress
												enableTrackSlot
												size="20px"
												color="inherit"
											/>
										) : (
											<FormattedMessage id="login" />
										)}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

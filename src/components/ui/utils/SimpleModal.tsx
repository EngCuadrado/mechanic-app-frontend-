// --- Imports de Librerías ---
import { Fragment, ReactNode } from "react";
import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
	DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// --- Props ---
interface SimpleModalProps {
	isOpen: boolean; // Estado para mostrar/ocultar
	onClose: () => void; // Función para cerrar
	title: string; // Título del header
	children: ReactNode; // Contenido del modal
	footer?: ReactNode; // (Opcional) Footer del modal
	custom?: string;
	widthClass?: string; // (Opcional) Ancho del modal
	disableOutsideClick?: boolean; // (Opcional) Evita cerrar al hacer click afuera
}

/**
 * Componente Modal centrado y animado.
 * Basado en Headless UI.
 */
export default function SimpleModal({
	isOpen,
	onClose,
	title,
	children,
	footer,
	custom = "",
	widthClass = "w-full max-w-md", // Por defecto un ancho mediano y responsivo
	disableOutsideClick = false, // Por defecto permite cerrar al hacer click afuera
}: SimpleModalProps) {
	const handleDialogClose = disableOutsideClick ? () => {} : onClose;

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-900"
				onClose={handleDialogClose}
			>
				{/* --- 1. El Fondo Oscuro (Overlay) --- */}
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					{/* Fondo oscuro con blur */}
					<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/60" />
				</TransitionChild>

				{/* --- 2. Contenedor para centrar el Modal --- */}
				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						{/* --- 3. El Panel del Modal --- */}
						<TransitionChild
							as={Fragment}
							// Animación de "Zoom" suave (Scale + Opacity)
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<DialogPanel
								className={`transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all ${widthClass} ${custom}`}
							>
								{/* --- Header del Modal --- */}
								<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
									<DialogTitle
										as="h3"
										className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
									>
										{title}
									</DialogTitle>

									<button
										onClick={onClose}
										className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-200 focus:outline-none"
									>
										<XMarkIcon
											className="h-6 w-6"
											aria-hidden="true"
										/>
									</button>
								</div>

								{/* --- Contenido del Modal --- */}
								<div className="p-6 text-gray-600 dark:text-gray-300">
									{children}
								</div>

								{/* --- Footer del Modal --- */}
								{footer && (
									<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
										{footer}
									</div>
								)}
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}

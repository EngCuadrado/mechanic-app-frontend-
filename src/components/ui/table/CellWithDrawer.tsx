// --- Imports de Librerías ---
import { Fragment, ReactNode } from "react";
import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// --- Props que el componente aceptará ---
interface SimpleDrawerProps {
	isOpen: boolean; // Estado para mostrar/ocultar
	onClose: () => void; // Función para cerrar
	title: string; // Título del header
	children: ReactNode; // Contenido del drawer
	widthClass?: string; // (Opcional) Para cambiar el ancho
}

/**
 * Un componente de Drawer (panel lateral) simple y controlado.
 * Usa Headless UI y Transition para las animaciones y accesibilidad.
 */
export default function CellWithDrawer({
	isOpen,
	onClose,
	title,
	children,
	widthClass = "w-96", // Ancho por defecto (w-96 = 384px)
}: SimpleDrawerProps) {
	return (
		// 'Transition' maneja la animación de entrada/salida del drawer completo
		<Transition appear show={isOpen} as={Fragment}>
			{/* 'Dialog' es el componente principal de Headless UI para modales/drawers */}
			{/* 'onClose' se activa al presionar 'Esc' o hacer clic fuera */}
			<Dialog as="div" className="relative z-200" onClose={onClose}>
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
					{/* Este div es el fondo oscuro/borroso */}
					<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />
				</TransitionChild>

				{/* Contenedor para el panel (necesario para la transición) */}
				<div className="fixed inset-0 overflow-hidden">
					<div className="absolute inset-0 overflow-hidden">
						<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
							{/* --- 2. El Panel del Drawer (el que desliza) --- */}
							<TransitionChild
								as={Fragment}
								enter="transform transition ease-in-out duration-300"
								enterFrom="translate-x-full" // Inicia fuera de la pantalla (derecha)
								enterTo="translate-x-0" // Termina en la pantalla
								leave="transform transition ease-in-out duration-200"
								leaveFrom="translate-x-0" // Inicia en la pantalla
								leaveTo="translate-x-full" // Termina fuera de la pantalla
							>
								<DialogPanel
									className={`pointer-events-auto relative flex h-full transform-gpu flex-col transition-transform rounded-md bg-gray-100 dark:bg-gray-800 p-0 ${widthClass}`}
								>
									{/* --- Header del Drawer --- */}
									<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-stone-200">
										<h2 className="text-lg font-semibold text-gray-800 dark:text-stone-200">
											{title}
										</h2>
										<div
											onClick={onClose}
											// variant="ghost"
											className="text-gray-500 dark:text-stone-200 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
										>
											<XMarkIcon className="w-6 h-6" />
										</div>
									</div>

									{/* --- Contenido del Drawer --- */}
									{/* 'flex-1' y 'overflow-auto' hacen que el contenido crezca y tenga scroll */}
									<div className="flex-1 overflow-auto text-gray-800 dark:text-stone-200 p-6">
										{children}
									</div>
								</DialogPanel>
							</TransitionChild>
						</div>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}

import { Fragment, type ReactNode } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";
import IconButton from "./IconButton";

interface BottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	/** Barra fija debajo del contenido (acción principal); no se desplaza con él. */
	footer?: ReactNode;
}

/** Panel que sube desde abajo en móvil (formularios y selectores); modal centrado en pantallas grandes. */
export default function BottomSheet({ isOpen, onClose, title, children, footer }: BottomSheetProps) {
	const intl = useIntl();
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-900" onClose={onClose}>
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-150"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm dark:bg-black/60" />
				</TransitionChild>
				<div className="fixed inset-0 flex items-end justify-center md:items-center md:p-4">
					<TransitionChild
						as={Fragment}
						enter="transition duration-200 ease-out"
						enterFrom="translate-y-full md:translate-y-0 md:scale-95 md:opacity-0"
						enterTo="translate-y-0 md:scale-100 md:opacity-100"
						leave="transition duration-150 ease-in"
						leaveFrom="translate-y-0 md:opacity-100"
						leaveTo="translate-y-full md:translate-y-0 md:opacity-0"
					>
						<DialogPanel className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-xl dark:bg-gray-900 md:max-w-lg md:rounded-2xl">
							<div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-800">
								<DialogTitle className="text-base font-semibold text-gray-800 dark:text-white/90">
									{title}
								</DialogTitle>
								<IconButton
									icon={<XMarkIcon />}
									label={intl.formatMessage({ id: "common.close", defaultMessage: "Cerrar" })}
									onClick={onClose}
								/>
							</div>
							<div className={`overflow-y-auto p-4 ${footer ? "" : "pb-[calc(1rem+env(safe-area-inset-bottom))]"}`}>
								{children}
							</div>
							{footer && (
								<div className="border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-gray-800">
									{footer}
								</div>
							)}
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
}

import type { ReactNode } from "react";

/** Barra de acciones pegada abajo, al alcance del pulgar. En escritorio queda como una tarjeta al final. */
export default function ActionBar({ children }: { children: ReactNode }) {
	return (
		<div className="sticky bottom-0 z-30 -mx-4 mt-4 flex items-center gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 md:mx-0 md:rounded-xl md:border">
			{children}
		</div>
	);
}

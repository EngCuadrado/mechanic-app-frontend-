import type { ReactNode } from "react";

export default function EmptyState({ icon, text }: { icon?: ReactNode; text: string }) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
			{icon && <span className="size-10 [&>svg]:size-10">{icon}</span>}
			<p className="text-sm">{text}</p>
		</div>
	);
}

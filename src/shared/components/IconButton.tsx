import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost" | "danger";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
	icon: ReactNode;
	/** Texto accesible. Obligatorio: es el aria-label y el tooltip. */
	label: string;
	/** Muestra el texto junto al icono (acciones poco obvias o destructivas). */
	showLabel?: boolean;
	variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
	primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20",
	outline:
		"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]",
	ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]",
	danger: "bg-red-600 text-white hover:bg-red-700",
};

/** Botón táctil: mínimo 44×44 px, icono con aria-label y title. */
export default function IconButton({
	icon,
	label,
	showLabel = false,
	variant = "ghost",
	className,
	type = "button",
	...props
}: IconButtonProps) {
	return (
		<button
			type={type}
			aria-label={label}
			title={label}
			className={clsx(
				"inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
				VARIANTS[variant],
				className,
			)}
			{...props}
		>
			<span className="size-6 shrink-0 [&>svg]:size-6">{icon}</span>
			{showLabel && <span className="whitespace-nowrap">{label}</span>}
		</button>
	);
}

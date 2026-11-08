import type { ReactNode } from "react";
import { useIntl } from "react-intl";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import ActionBar from "./ActionBar";
import IconButton from "./IconButton";

interface Props {
	title: string;
	/** Paso actual, desde 1. */
	step: number;
	total: number;
	onBack?: () => void;
	nextLabel: string;
	onNext: () => void;
	nextDisabled?: boolean;
	loading?: boolean;
	children: ReactNode;
}

/** Pantalla de un paso: título, progreso, contenido y una sola acción principal abajo. */
export default function StepFlow({ title, step, total, onBack, nextLabel, onNext, nextDisabled, loading, children }: Props) {
	const intl = useIntl();
	const back = intl.formatMessage({ id: "common.back", defaultMessage: "Atrás" });
	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
			<div className="flex items-center gap-3">
				{onBack && <IconButton icon={<ArrowLeftIcon />} label={back} onClick={onBack} />}
				<div className="min-w-0 flex-1">
					<h1 className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h1>
					<div className="mt-2 flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
						{Array.from({ length: total }, (_, i) => (
							<span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}`} />
						))}
					</div>
				</div>
			</div>
			{children}
			<ActionBar>
				<IconButton
					variant="primary"
					showLabel
					className="flex-1"
					disabled={nextDisabled || loading}
					icon={<ArrowRightIcon />}
					label={nextLabel}
					onClick={onNext}
				/>
			</ActionBar>
		</div>
	);
}

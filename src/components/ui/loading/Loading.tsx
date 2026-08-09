import React from "react";
import { FormattedMessage } from "react-intl";

interface LoadingProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

const Loading: React.FC<LoadingProps> = ({ className = "", size = "md" }) => {
	const sizeClasses = {
		sm: "w-5 h-5 border-2",
		md: "w-8 h-8 border-4",
		lg: "w-12 h-12 border-6",
	};

	return (
		<div
			className={`flex items-center justify-center w-full h-full ${className}`}
		>
			<div
				className={`${sizeClasses[size]} border-gray-200 border-t-brand-500 rounded-full animate-spin dark:border-gray-800 dark:border-t-brand-400`}
				role="status"
			>
				<span className="sr-only">
					<FormattedMessage id="loading" />
				</span>
			</div>
		</div>
	);
};

export default Loading;

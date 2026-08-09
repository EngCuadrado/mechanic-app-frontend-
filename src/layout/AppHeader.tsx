import { useEffect, useRef, useState } from "react";

import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import { CgMenuLeft } from "react-icons/cg";
import { IoIosArrowBack } from "react-icons/io";

import { useIntl } from "react-intl";

const AppHeader: React.FC = () => {
	const intl = useIntl();
	const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

	const { isMobileOpen, toggleSidebar, toggleMobileSidebar, isExpanded } =
		useSidebar();

	const handleToggle = () => {
		if (window.innerWidth >= 1024) {
			toggleSidebar();
		} else {
			toggleMobileSidebar();
		}
	};

	const toggleApplicationMenu = () => {
		setApplicationMenuOpen(!isApplicationMenuOpen);
	};

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "k") {
				event.preventDefault();
				inputRef.current?.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	return (
		<header className="sticky top-0 flex w-full bg-white border-gray-200 z-100 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
			<div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
				<div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
					<button
						className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-100 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
						onClick={handleToggle}
						aria-label={intl.formatMessage({
							id: "layout.header.toggle_sidebar",
						})}
					>
						{/* TODO: Mejorar vista mobile */}
						{isMobileOpen ? (
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
									fill="currentColor"
								/>
							</svg>
						) : (
							<span className="relative inline-flex items-center justify-center w-5 h-5">
								<span
									className={`
                    absolute transition-opacity duration-300 ease-in-out
                    ${isExpanded ? "opacity-0" : "opacity-100"}
                  `}
									aria-hidden={isExpanded}
								>
									<CgMenuLeft className="size-5" />
								</span>

								<span
									className={`
                  absolute transition-opacity duration-300 ease-in-out
                  ${isExpanded ? "opacity-100" : "opacity-0"}
                `}
									aria-hidden={!isExpanded}
								>
									<IoIosArrowBack className="size-5" />
								</span>
							</span>
						)}
					</button>
				</div>
				<div
					className={`${isApplicationMenuOpen ? "flex" : "hidden"
						} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
				>
					<div className="flex items-center gap-2 2xsm:gap-3">
						<ThemeToggleButton />
					</div>
					<UserDropdown />
				</div>
			</div>
		</header>
	);
};

export default AppHeader;

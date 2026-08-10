import { useIntl } from "react-intl";
import { Link, useLocation } from "react-router";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
	FolderOpenIcon,
	ShoppingCartIcon,
	ReceiptPercentIcon,
	UserGroupIcon,
	ChartBarIcon,
	ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

import { ChevronDownIcon, GridIcon, HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type NavItem = {
	name: string;
	icon: React.ReactNode;
	path?: string;
	roles?: number[];
	subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
	const { isExpanded, isMobileOpen } = useSidebar();
	const { user } = useAuth();
	const location = useLocation();
	const intl = useIntl();

	const navItems: NavItem[] = useMemo(() => {
		const items: NavItem[] = [
			{
				icon: <GridIcon />,
				name: intl.formatMessage({ id: "layout.sidebar.dashboard" }),
				path: "/calendar",
				// roles: [1, 2],
			},
			{
				icon: <ShoppingCartIcon />,
				name: intl.formatMessage({ id: "sales" }, { count: 2 }),
				path: "/sales",
				// roles: [1, 2],
			},
			{
				icon: <ReceiptPercentIcon />,
				name: intl.formatMessage({ id: "transactions" }, { count: 2 }),
				path: "/transactions",
				// roles: [1, 2],
			},
			{
				icon: <AiOutlineMedicineBox />,
				name: intl.formatMessage({ id: "products" }, { count: 2 }),
				path: "/products",
				// roles: [1, 2],
			},
			// {
			//     icon: <ClipboardDocumentListIcon className="size-6" />,
			//     name: intl.formatMessage({ id: 'inventory' }),
			//     path: "/inventario",
			//     roles: [1]
			// },
			// {
			//     icon: <UserGroupIcon className="size-6" />,
			//     name: intl.formatMessage({ id: 'employees' }),
			//     path: "/empleados",
			//     roles: [1]
			// },
			// {
			//     icon: <ChartBarIcon className="size-6" />,
			//     name: intl.formatMessage({ id: 'reports' }),
			//     path: "/reportes",
			//     roles: [1]
			// },
			{
				icon: <FolderOpenIcon />,
				name: intl.formatMessage({ id: "catalogs" }, { count: 2 }),
				path: "/catalogs",
				// roles: [1],
			},
		];

		return items;
	}, [intl, user]);

	const othersItems: NavItem[] = [];
	/**  {
            icon: <PieChartIcon />,
            name: "Charts",
            subItems: [
                { name: "Line Chart", path: "/line-chart", pro: false },
                { name: "Bar Chart", path: "/bar-chart", pro: false },
            ],
        },
        {
            icon: <BoxCubeIcon />,
            name: "UI Elements",
            subItems: [
                { name: "Alerts", path: "/alerts", pro: false },
                { name: "Avatar", path: "/avatars", pro: false },
                { name: "Badge", path: "/badge", pro: false },
                { name: "Buttons", path: "/buttons", pro: false },
                { name: "Images", path: "/images", pro: false },
                { name: "Videos", path: "/videos", pro: false },
            ],
        },
        {
            icon: <PlugInIcon />,
            name: "Authentication",
            subItems: [
                { name: "Sign In", path: "/signin", pro: false },
                { name: "Sign Up", path: "/signup", pro: false },
            ],
        },**/

	const [openSubmenu, setOpenSubmenu] = useState<{
		type: "main" | "others";
		index: number;
	} | null>(null);
	const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
		{},
	);
	const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

	// const isActive = (path: string) => location.pathname === path;
	const isActive = useCallback(
		(path: string) => location.pathname === path,
		[location.pathname],
	);

	useEffect(() => {
		let submenuMatched = false;
		["main", "others"].forEach((menuType) => {
			const items = menuType === "main" ? navItems : othersItems;
			items.forEach((nav, index) => {
				if (nav.subItems) {
					nav.subItems.forEach((subItem) => {
						if (isActive(subItem.path)) {
							setOpenSubmenu({
								type: menuType as "main" | "others",
								index,
							});
							submenuMatched = true;
						}
					});
				}
			});
		});

		if (!submenuMatched) {
			setOpenSubmenu(null);
		}
	}, [location, isActive]);

	useEffect(() => {
		if (openSubmenu !== null) {
			const key = `${openSubmenu.type}-${openSubmenu.index}`;
			if (subMenuRefs.current[key]) {
				setSubMenuHeight((prevHeights) => ({
					...prevHeights,
					[key]: subMenuRefs.current[key]?.scrollHeight || 0,
				}));
			}
		}
	}, [openSubmenu]);

	const handleSubmenuToggle = (
		index: number,
		menuType: "main" | "others",
	) => {
		setOpenSubmenu((prevOpenSubmenu) => {
			if (
				prevOpenSubmenu &&
				prevOpenSubmenu.type === menuType &&
				prevOpenSubmenu.index === index
			) {
				return null;
			}
			return { type: menuType, index };
		});
	};

	const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
		<ul className="flex flex-col gap-4">
			{items.map((nav, index) => (
				<li key={nav.name}>
					{nav.subItems ? (
						<button
							onClick={() => handleSubmenuToggle(index, menuType)}
							className={`menu-item group ${
								openSubmenu?.type === menuType &&
								openSubmenu?.index === index
									? "menu-item-active"
									: "menu-item-inactive"
							} cursor-pointer ${
								!isExpanded
									? "lg:justify-center"
									: "lg:justify-start"
							}`}
						>
							<span
								className={`menu-item-icon-size  ${
									openSubmenu?.type === menuType &&
									openSubmenu?.index === index
										? "menu-item-icon-active"
										: "menu-item-icon-inactive"
								}`}
							>
								{nav.icon}
							</span>
							{(isExpanded || isMobileOpen) && (
								<span className="menu-item-text">
									{nav.name}
								</span>
							)}
							{(isExpanded || isMobileOpen) && (
								<ChevronDownIcon
									className={`ml-auto w-5 h-5 transition-transform duration-200 ${
										openSubmenu?.type === menuType &&
										openSubmenu?.index === index
											? "rotate-180 text-brand-500"
											: ""
									}`}
								/>
							)}
						</button>
					) : (
						nav.path && (
							<Link
								to={nav.path}
								className={`menu-item group ${
									isActive(nav.path)
										? "menu-item-active"
										: "menu-item-inactive"
								}`}
							>
								<span
									className={`menu-item-icon-size ${
										isActive(nav.path)
											? "menu-item-icon-active"
											: "menu-item-icon-inactive"
									}`}
								>
									{nav.icon}
								</span>
								{(isExpanded || isMobileOpen) && (
									<span className="menu-item-text">
										{nav.name}
									</span>
								)}
							</Link>
						)
					)}
					{nav.subItems && (isExpanded || isMobileOpen) && (
						<div
							ref={(el) => {
								subMenuRefs.current[`${menuType}-${index}`] =
									el;
							}}
							className="overflow-hidden transition-all duration-300"
							style={{
								height:
									openSubmenu?.type === menuType &&
									openSubmenu?.index === index
										? `${subMenuHeight[`${menuType}-${index}`]}px`
										: "0px",
							}}
						>
							<ul className="mt-2 space-y-1 ml-9">
								{nav.subItems.map((subItem) => (
									<li key={subItem.name}>
										<Link
											to={subItem.path}
											className={`menu-dropdown-item ${
												isActive(subItem.path)
													? "menu-dropdown-item-active"
													: "menu-dropdown-item-inactive"
											}`}
										>
											{subItem.name}
											<span className="flex items-center gap-1 ml-auto">
												{subItem.new && (
													<span
														className={`ml-auto ${
															isActive(
																subItem.path,
															)
																? "menu-dropdown-badge-active"
																: "menu-dropdown-badge-inactive"
														} menu-dropdown-badge`}
													>
														{intl.formatMessage({
															id: "layout.sidebar.new",
														})}
													</span>
												)}
												{subItem.pro && (
													<span
														className={`ml-auto ${
															isActive(
																subItem.path,
															)
																? "menu-dropdown-badge-active"
																: "menu-dropdown-badge-inactive"
														} menu-dropdown-badge`}
													>
														{intl.formatMessage({
															id: "layout.sidebar.pro",
														})}
													</span>
												)}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</li>
			))}
		</ul>
	);

	return (
		<aside
			className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-width transition-transform duration-1500 ease-in-out z-50 border-r border-gray-200 
      ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
		>
			{/* TODO: Mejorar vista mobile */}

			<div
				className={`py-8 flex ${
					!isExpanded ? "lg:justify-center" : "justify-start"
				}`}
			>
				<Link to="/home">
					{isExpanded || isMobileOpen ? (
						<>
							<img
								className="dark:hidden"
								src="/images/logo/logo.svg"
								alt="Logo"
								width={150}
								height={40}
							/>
							<img
								className="hidden dark:block"
								src="/images/logo/logo-dark.svg"
								alt="Logo"
								width={150}
								height={40}
							/>
						</>
					) : (
						<img
							src="/images/logo/logo-icon.svg"
							alt="Logo"
							width={32}
							height={32}
						/>
					)}
				</Link>
			</div>
			<div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
				<nav className="mb-6">
					<div className="flex flex-col gap-4">
						<div>
							<h2
								className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
									!isExpanded
										? "lg:justify-center"
										: "justify-start"
								}`}
							>
								{isExpanded || isMobileOpen ? (
									intl.formatMessage({
										id: "layout.sidebar.menu",
									})
								) : (
									<HorizontaLDots className="size-6" />
								)}
							</h2>
							{renderMenuItems(navItems, "main")}
						</div>
						{/* <div className="">
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded ? "lg:justify-center" : "justify-start"
                                    }`}
                            >
                                {isExpanded || isMobileOpen ? (
                                    "Others"
                                ) : (
                                    <HorizontaLDots />
                                )}
                            </h2>
                            {renderMenuItems(othersItems, "others")}
                        </div> */}
					</div>
				</nav>
			</div>
		</aside>
	);
};

export default AppSidebar;

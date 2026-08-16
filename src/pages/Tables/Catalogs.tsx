// src/pages/Tables/BasicTables.tsx

import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { FormattedMessage, useIntl } from "react-intl";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Brands from "../../components/ui/catalogs/Brands";
import Categories from "../../components/ui/catalogs/Categories";
import ActiveIngredients from "../../components/ui/catalogs/ActiveIngredients";
import AdministrationRoutes from "../../components/ui/catalogs/AdministrationRoutes";
import SupplierTypes from "../../components/ui/catalogs/SupplierTypes";
import Suppliers from "../../components/ui/catalogs/Suppliers";
import Mechanics from "../../components/ui/catalogs/Mechanics";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
}

export default function Catalogs() {
	const intl = useIntl();

	const [value, setValue] = React.useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	const items = [
		{
			label: <FormattedMessage id="mechanics" values={{ count: 2 }} />,
			content: <Mechanics />,
		},
	];

	return (
		<div className="h-full w-full">
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "catalogs" }, { count: 2 })}
			/>
			<div
				className={`rounded-2xl border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-white/[0.03] p-4`}
			>
				<Box sx={{ width: "100%" }}>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						{/* Renderizado dinámico de las Pestañas (Tabs) */}
						<Tabs
							value={value}
							onChange={handleChange}
							variant="scrollable"
							scrollButtons
							allowScrollButtonsMobile
							aria-label="scrollable auto tabs example"
							sx={{
								".dark & .MuiTab-root": {
									color: "#9ca3af", // Gris (text-gray-400)
								},
								
								".dark & .MuiTab-root.Mui-selected": {
									color: "#ffffff !important", // Blanco para que resalte
								},

								".dark & .MuiTabScrollButton-root": {
									color: "#9ca3af",
								},

								".dark & .MuiTabs-indicator": {
									backgroundColor: "#ffffff", 
								}
							}}
						>
							{items.map((item, index) => (
								<Tab
									key={index}
									label={item.label}
									{...a11yProps(index)}
								/>
							))}
						</Tabs>
					</Box>

					{/* Renderizado dinámico del Contenido (Panels) */}
					{items.map((item, index) => (
						<CustomTabPanel key={index} value={value} index={index}>
							{item.content}
						</CustomTabPanel>
					))}
				</Box>
			</div>
		</div>
	);
}

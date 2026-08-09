import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { FormattedMessage, useIntl } from "react-intl";

import Medicines from "../../components/ui/catalogs/Medicines";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

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

export default function Products() {
	const intl = useIntl();

	const [value, setValue] = React.useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	// Definición de los datos
	const items = [
		{
			label: <FormattedMessage id="medicine" values={{ count: 2 }} />,
			content: <Medicines />,
		},
	];

	// return (
	//   <div className="h-full w-full">
	//     <PageBreadcrumb pageTitle={intl.formatMessage({ id: "products" }, { count: 2 })} />
	//     <div
	//       className={`rounded-2xl border border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-white/[0.03] p-4`}>
	//       <Box sx={{ width: '100%' }}>
	//         <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
	//           {/* Renderizado dinámico de las Pestañas (Tabs) */}
	//           <Tabs
	//             value={value}
	//             onChange={handleChange}
	//             variant="scrollable"
	//             scrollButtons
	//             allowScrollButtonsMobile
	//             aria-label="scrollable auto tabs example">
	//             {items.map((item, index) => (
	//               <Tab
	//                 key={index}
	//                 label={item.label}
	//                 {...a11yProps(index)}
	//               />
	//             ))}
	//           </Tabs>
	//         </Box>

	//         {/* Renderizado dinámico del Contenido (Panels) */}
	//         {items.map((item, index) => (
	//           <CustomTabPanel key={index} value={value} index={index}>
	//             {item.content}
	//           </CustomTabPanel>
	//         ))}
	//       </Box>
	//     </div>
	//   </div>
	// );

	return (
		<div className="flex-1">
			<div className="flex items-center justify-between mb-4">
				<PageBreadcrumb
					pageTitle={intl.formatMessage(
						{ id: "medicines" },
						{ count: 2 },
					)}
				/>
				{/* <div className="mb-6">
                    <SalesExportButton />
                </div> */}
			</div>

			<Medicines />
		</div>
	);
}

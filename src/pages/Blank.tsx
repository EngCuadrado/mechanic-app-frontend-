import PageBreadcrumb from "../components/common/PageBreadCrumb";
// import PageMeta from "../components/common/PageMeta";
import { gql } from "@apollo/client";
import { useIntl } from "react-intl";

export const GET_USERS = gql`
	query ObtenerRoles {
		employeeRoles {
			employeeRoleId
			name
			status
		}
	}
`;

export default function Blank() {
	const intl = useIntl();

	return (
		<div>
			{/* <PageMeta
        title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      /> */}
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "blank_page" })}
			/>
			<div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
				<div className="mx-auto w-full max-w-[630px] text-center">
					{/* <h1>HOLA</h1> */}
				</div>
			</div>
		</div>
	);
}

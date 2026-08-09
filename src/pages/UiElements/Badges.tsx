import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { PlusIcon } from "../../icons";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { useIntl } from "react-intl";

export default function Badges() {
	const intl = useIntl();
	return (
		<div>
			<PageMeta
				title="React.js Badges Dashboard | TailAdmin - React.js Admin Dashboard Template"
				description="This is React.js Badges Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
			/>
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "ui.badges" })}
			/>
			<div className="space-y-5 sm:space-y-6">
				<ComponentCard
					title={intl.formatMessage({ id: "ui.light_background" })}
				>
					<div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
						{/* Light Variant */}
						<Badge variant="light" color="primary">
							{intl.formatMessage({ id: "ui.primary" })}
						</Badge>
						<Badge variant="light" color="success">
							{intl.formatMessage({ id: "ui.success" })}
						</Badge>{" "}
						<Badge variant="light" color="error">
							{intl.formatMessage({ id: "ui.error" })}
						</Badge>{" "}
						<Badge variant="light" color="warning">
							{intl.formatMessage({ id: "ui.warning" })}
						</Badge>{" "}
						<Badge variant="light" color="info">
							{intl.formatMessage({ id: "ui.info" })}
						</Badge>
						<Badge variant="light" color="light">
							{intl.formatMessage({ id: "ui.light" })}
						</Badge>
						<Badge variant="light" color="dark">
							{intl.formatMessage({ id: "ui.dark" })}
						</Badge>
					</div>
				</ComponentCard>
				<ComponentCard
					title={intl.formatMessage({ id: "ui.solid_background" })}
				>
					<div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
						{/* Light Variant */}
						<Badge variant="solid" color="primary">
							{intl.formatMessage({ id: "ui.primary" })}
						</Badge>
						<Badge variant="solid" color="success">
							{intl.formatMessage({ id: "ui.success" })}
						</Badge>{" "}
						<Badge variant="solid" color="error">
							{intl.formatMessage({ id: "ui.error" })}
						</Badge>{" "}
						<Badge variant="solid" color="warning">
							{intl.formatMessage({ id: "ui.warning" })}
						</Badge>{" "}
						<Badge variant="solid" color="info">
							{intl.formatMessage({ id: "ui.info" })}
						</Badge>
						<Badge variant="solid" color="light">
							{intl.formatMessage({ id: "ui.light" })}
						</Badge>
						<Badge variant="solid" color="dark">
							{intl.formatMessage({ id: "ui.dark" })}
						</Badge>
					</div>
				</ComponentCard>
				<ComponentCard
					title={intl.formatMessage({
						id: "ui.light_background_left_icon",
					})}
				>
					<div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
						<Badge
							variant="light"
							color="primary"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.primary" })}
						</Badge>
						<Badge
							variant="light"
							color="success"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.success" })}
						</Badge>{" "}
						<Badge
							variant="light"
							color="error"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.error" })}
						</Badge>{" "}
						<Badge
							variant="light"
							color="warning"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.warning" })}
						</Badge>{" "}
						<Badge
							variant="light"
							color="info"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.info" })}
						</Badge>
						<Badge
							variant="light"
							color="light"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.light" })}
						</Badge>
						<Badge
							variant="light"
							color="dark"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.dark" })}
						</Badge>
					</div>
				</ComponentCard>
				<ComponentCard
					title={intl.formatMessage({
						id: "ui.solid_background_left_icon",
					})}
				>
					<div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
						<Badge
							variant="solid"
							color="primary"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.primary" })}
						</Badge>
						<Badge
							variant="solid"
							color="success"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.success" })}
						</Badge>{" "}
						<Badge
							variant="solid"
							color="error"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.error" })}
						</Badge>{" "}
						<Badge
							variant="solid"
							color="warning"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.warning" })}
						</Badge>{" "}
						<Badge
							variant="solid"
							color="info"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.info" })}
						</Badge>
						<Badge
							variant="solid"
							color="light"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.light" })}
						</Badge>
						<Badge
							variant="solid"
							color="dark"
							startIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.dark" })}
						</Badge>
					</div>
				</ComponentCard>
				<ComponentCard
					title={intl.formatMessage({
						id: "ui.light_background_right_icon",
					})}
				>
					<div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
						<Badge
							variant="light"
							color="primary"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.primary" })}
						</Badge>
						<Badge
							variant="light"
							color="success"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.success" })}
						</Badge>{" "}
						<Badge
							variant="light"
							color="error"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.error" })}
						</Badge>{" "}
						<Badge
							variant="light"
							color="warning"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.warning" })}
						</Badge>{" "}
						<Badge
							variant="light"
							color="info"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.info" })}
						</Badge>
						<Badge
							variant="light"
							color="light"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.light" })}
						</Badge>
						<Badge
							variant="light"
							color="dark"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.dark" })}
						</Badge>
					</div>
				</ComponentCard>
				<ComponentCard
					title={intl.formatMessage({
						id: "ui.solid_background_right_icon",
					})}
				>
					<div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
						<Badge
							variant="solid"
							color="primary"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.primary" })}
						</Badge>
						<Badge
							variant="solid"
							color="success"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.success" })}
						</Badge>{" "}
						<Badge
							variant="solid"
							color="error"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.error" })}
						</Badge>{" "}
						<Badge
							variant="solid"
							color="warning"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.warning" })}
						</Badge>{" "}
						<Badge
							variant="solid"
							color="info"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.info" })}
						</Badge>
						<Badge
							variant="solid"
							color="light"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.light" })}
						</Badge>
						<Badge
							variant="solid"
							color="dark"
							endIcon={<PlusIcon />}
						>
							{intl.formatMessage({ id: "ui.dark" })}
						</Badge>
					</div>
				</ComponentCard>
			</div>
		</div>
	);
}

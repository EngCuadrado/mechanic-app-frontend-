import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { BoxIcon } from "../../icons";
import { useIntl } from "react-intl";

export default function Buttons() {
	const intl = useIntl();
	return (
		<div>
			<PageMeta
				title="React.js Buttons Dashboard | TailAdmin - React.js Admin Dashboard Template"
				description="This is React.js Buttons Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
			/>
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "ui.buttons" })}
			/>
			<div className="space-y-5 sm:space-y-6">
				{/* Primary Button */}
				<ComponentCard
					title={intl.formatMessage({ id: "ui.primary_button" })}
				>
					<div className="flex items-center gap-5">
						<Button size="sm" variant="primary">
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
						<Button size="md" variant="primary">
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
					</div>
				</ComponentCard>
				{/* Primary Button with Start Icon */}
				<ComponentCard
					title={intl.formatMessage({
						id: "ui.primary_button_left_icon",
					})}
				>
					<div className="flex items-center gap-5">
						<Button
							size="sm"
							variant="primary"
							startIcon={<BoxIcon className="size-5" />}
						>
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
						<Button
							size="md"
							variant="primary"
							startIcon={<BoxIcon className="size-5" />}
						>
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
					</div>
				</ComponentCard>
				{/* Primary Button with Start Icon */}
				<ComponentCard
					title={intl.formatMessage({
						id: "ui.primary_button_right_icon",
					})}
				>
					<div className="flex items-center gap-5">
						<Button
							size="sm"
							variant="primary"
							endIcon={<BoxIcon className="size-5" />}
						>
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
						<Button
							size="md"
							variant="primary"
							endIcon={<BoxIcon className="size-5" />}
						>
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
					</div>
				</ComponentCard>
				{/* Outline Button */}
				<ComponentCard
					title={intl.formatMessage({ id: "ui.secondary_button" })}
				>
					<div className="flex items-center gap-5">
						{/* Outline Button */}
						<Button size="sm" variant="outline">
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
						<Button size="md" variant="outline">
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
					</div>
				</ComponentCard>
				{/* Outline Button with Start Icon */}
				<ComponentCard
					title={intl.formatMessage({
						id: "ui.outline_button_left_icon",
					})}
				>
					<div className="flex items-center gap-5">
						<Button
							size="sm"
							variant="outline"
							startIcon={<BoxIcon className="size-5" />}
						>
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
						<Button
							size="md"
							variant="outline"
							startIcon={<BoxIcon className="size-5" />}
						>
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
					</div>
				</ComponentCard>{" "}
				{/* Outline Button with Start Icon */}
				<ComponentCard
					title={intl.formatMessage({
						id: "ui.outline_button_right_icon",
					})}
				>
					<div className="flex items-center gap-5">
						<Button
							size="sm"
							variant="outline"
							endIcon={<BoxIcon className="size-5" />}
						>
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
						<Button
							size="md"
							variant="outline"
							endIcon={<BoxIcon className="size-5" />}
						>
							{intl.formatMessage({ id: "ui.button_text" })}
						</Button>
					</div>
				</ComponentCard>
			</div>
		</div>
	);
}

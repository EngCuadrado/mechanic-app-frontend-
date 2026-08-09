import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ResponsiveImage from "../../components/ui/images/ResponsiveImage";
import TwoColumnImageGrid from "../../components/ui/images/TwoColumnImageGrid";
import ThreeColumnImageGrid from "../../components/ui/images/ThreeColumnImageGrid";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useIntl } from "react-intl";

export default function Images() {
	const intl = useIntl();
	return (
		<>
			<PageMeta
				title="React.js Images Dashboard | TailAdmin - React.js Admin Dashboard Template"
				description="This is React.js Images page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
			/>
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "ui.images" })}
			/>
			<div className="space-y-5 sm:space-y-6">
				<ComponentCard
					title={intl.formatMessage({ id: "ui.responsive_image" })}
				>
					<ResponsiveImage />
				</ComponentCard>
				<ComponentCard
					title={intl.formatMessage({ id: "ui.image_2_grid" })}
				>
					<TwoColumnImageGrid />
				</ComponentCard>
				<ComponentCard
					title={intl.formatMessage({ id: "ui.image_3_grid" })}
				>
					<ThreeColumnImageGrid />
				</ComponentCard>
			</div>
		</>
	);
}

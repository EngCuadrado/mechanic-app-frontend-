import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FourIsToThree from "../../components/ui/videos/FourIsToThree";
import OneIsToOne from "../../components/ui/videos/OneIsToOne";
import SixteenIsToNine from "../../components/ui/videos/SixteenIsToNine";
import TwentyOneIsToNine from "../../components/ui/videos/TwentyOneIsToNine";
import { useIntl } from "react-intl";

export default function Videos() {
	const intl = useIntl();
	return (
		<>
			<PageMeta
				title="React.js Videos Tabs | TailAdmin - React.js Admin Dashboard Template"
				description="This is React.js Videos page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
			/>
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "ui.videos" })}
			/>
			<div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
				<div className="space-y-5 sm:space-y-6">
					<ComponentCard
						title={`${intl.formatMessage({ id: "ui.video_ratio" })} 16:9`}
					>
						<SixteenIsToNine />
					</ComponentCard>
					<ComponentCard
						title={`${intl.formatMessage({ id: "ui.video_ratio" })} 4:3`}
					>
						<FourIsToThree />
					</ComponentCard>
				</div>
				<div className="space-y-5 sm:space-y-6">
					<ComponentCard
						title={`${intl.formatMessage({ id: "ui.video_ratio" })} 21:9`}
					>
						<TwentyOneIsToNine />
					</ComponentCard>
					<ComponentCard
						title={`${intl.formatMessage({ id: "ui.video_ratio" })} 1:1`}
					>
						<OneIsToOne />
					</ComponentCard>
				</div>
			</div>
		</>
	);
}

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import PageMeta from "../../components/common/PageMeta";
import { useIntl } from "react-intl";

export default function Alerts() {
	const intl = useIntl();
	return (
		<>
			<PageMeta
				title="React.js Alerts Dashboard | TailAdmin - React.js Admin Dashboard Template"
				description="This is React.js Alerts Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
			/>
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "ui.alerts" })}
			/>
			<div className="space-y-5 sm:space-y-6">
				<ComponentCard
					title={intl.formatMessage({ id: "ui.success_alert" })}
				>
					<Alert
						variant="success"
						title={intl.formatMessage({ id: "ui.success_message" })}
						message={intl.formatMessage({ id: "ui.be_cautious" })}
						showLink={true}
						linkHref="/"
						linkText={intl.formatMessage({ id: "ui.learn_more" })}
					/>
					<Alert
						variant="success"
						title={intl.formatMessage({ id: "ui.success_message" })}
						message={intl.formatMessage({ id: "ui.be_cautious" })}
						showLink={false}
					/>
				</ComponentCard>
				<ComponentCard
					title={intl.formatMessage({ id: "ui.warning_alert" })}
				>
					<Alert
						variant="warning"
						title={intl.formatMessage({ id: "ui.warning_message" })}
						message={intl.formatMessage({ id: "ui.be_cautious" })}
						showLink={true}
						linkHref="/"
						linkText={intl.formatMessage({ id: "ui.learn_more" })}
					/>
					<Alert
						variant="warning"
						title={intl.formatMessage({ id: "ui.warning_message" })}
						message={intl.formatMessage({ id: "ui.be_cautious" })}
						showLink={false}
					/>
				</ComponentCard>{" "}
				<ComponentCard
					title={intl.formatMessage({ id: "ui.error_alert" })}
				>
					<Alert
						variant="error"
						title={intl.formatMessage({ id: "ui.error_message" })}
						message={intl.formatMessage({ id: "ui.be_cautious" })}
						showLink={true}
						linkHref="/"
						linkText={intl.formatMessage({ id: "ui.learn_more" })}
					/>
					<Alert
						variant="error"
						title={intl.formatMessage({ id: "ui.error_message" })}
						message={intl.formatMessage({ id: "ui.be_cautious" })}
						showLink={false}
					/>
				</ComponentCard>{" "}
				<ComponentCard
					title={intl.formatMessage({ id: "ui.info_alert" })}
				>
					<Alert
						variant="info"
						title={intl.formatMessage({ id: "ui.info_message" })}
						message={intl.formatMessage({ id: "ui.be_cautious" })}
						showLink={true}
						linkHref="/"
						linkText={intl.formatMessage({ id: "ui.learn_more" })}
					/>
					<Alert
						variant="info"
						title={intl.formatMessage({ id: "ui.info_message" })}
						message={intl.formatMessage({ id: "ui.be_cautious" })}
						showLink={false}
					/>
				</ComponentCard>
			</div>
		</>
	);
}

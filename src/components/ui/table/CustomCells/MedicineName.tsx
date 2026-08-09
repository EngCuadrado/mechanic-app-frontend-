import { useIntl } from "react-intl";

const MedicineName = ({ row }: any) => {
	const intl = useIntl();
	const { name, requires_prescription } = row.original; // Ojo aquí con .original
	return (
		<div className="flex flex-row items-center gap-2 capitalize">
			{name}
			{!!requires_prescription && (
				<span
					className="text-xs bg-gray-200 rounded-full p-1 cursor-default"
					data-tooltip
					data-tooltip-id="global-tooltip"
					data-tooltip-content={intl.formatMessage({
						id: "requires.prescription",
					})}
				>
					Rx
				</span>
			)}
		</div>
	);
};

export default MedicineName;

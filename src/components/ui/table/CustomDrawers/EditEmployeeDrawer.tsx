import { useIntl } from "react-intl";
import CellWithDrawer from "../CellWithDrawer";
import EditEmployeeForm from "../CustomCells/EditEmployee";

interface EditEmployeeDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	row: any;
	onSaveSuccess?: () => void;
}

export default function EditEmployeeDrawer({
	isOpen,
	onClose,
	row,
	onSaveSuccess,
}: EditEmployeeDrawerProps) {
	const intl = useIntl();

	return (
		<CellWithDrawer
			isOpen={isOpen}
			onClose={onClose}
			title={intl.formatMessage({ id: "edit_user" })}
			widthClass="w-150"
		>
			<EditEmployeeForm
				row={row}
				onClose={onClose}
				onSaveSuccess={() => {
					if (onSaveSuccess) {
						onSaveSuccess();
					} else {
						onClose();
					}
				}}
			/>
		</CellWithDrawer>
	);
}

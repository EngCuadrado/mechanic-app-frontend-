import { useState, Fragment } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import SimpleModal from "../../../ui/utils/SimpleModal";
import EditBatch from "../CustomModels/EditBatch";

export const BatchTableActions = ({ row }: any) => {
	const [isEditOpen, setIsEditOpen] = useState(false);
	const intl = useIntl();

	return (
		<Fragment>
			<div className="flex items-center justify-center">
				<button
					onClick={() => setIsEditOpen(true)}
					className="p-2 text-gray-500 hover:text-brand-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-800"
					title={intl.formatMessage({ id: "edit" })}
				>
					<PencilSquareIcon className="size-5 dark:text-gray-100" />
				</button>
			</div>

			{isEditOpen && (
				<SimpleModal
					isOpen={true}
					onClose={() => setIsEditOpen(false)}
					title={intl.formatMessage({ id: "batch.edit" })}
					widthClass="w-[50%]"
				>
					<EditBatch
						batch={row.original}
						onClose={() => setIsEditOpen(false)}
					/>
				</SimpleModal>
			)}
		</Fragment>
	);
};

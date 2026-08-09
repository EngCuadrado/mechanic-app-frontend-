import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";

const TransactionEmployee = ({ row }: any) => {
	const employee = row.original.employee;
	const fullName = `${employee.names} ${employee.lastnames}`;

	return (
		<div className="flex items-center gap-2 py-1">
			<div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
				<UserIcon className="size-4 text-gray-600 dark:text-gray-400" />
			</div>
			<span className="text-sm font-semibold text-gray-900 dark:text-white">
				{fullName}
			</span>
		</div>
	);
};

export default TransactionEmployee;

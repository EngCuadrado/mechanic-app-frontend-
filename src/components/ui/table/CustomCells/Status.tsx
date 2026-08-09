import React from "react";
import { FormattedMessage } from "react-intl";

import Badge from "../../../ui/badge/Badge";

type StatusProps = {
	status: boolean;
};

const Status: React.FC<StatusProps> = ({ status }) => {
	return (
		<Badge color={status ? "success" : "error"}>
			{status ? (
				<FormattedMessage
					id="active"
					values={{
						gender: "female",
					}}
				/>
			) : (
				<FormattedMessage
					id="inactive"
					values={{
						gender: "female",
					}}
				/>
			)}
		</Badge>
	);
};

export default Status;

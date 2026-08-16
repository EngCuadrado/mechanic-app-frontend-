import { useState, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";

import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_MECHANIC_MUTATION, GET_MECHANICS_QUERY, GET_MECHANIC_SPECIALTIES_QUERY } from "../QuerysDefinitions";

export default function AddNewMechanic({ onClose }: { onClose?: () => void }) {
	const intl = useIntl();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [specialtyId, setSpecialtyId] = useState<string>("");

	const [mutateFunction, { loading: saving }] = useMutation(ADD_MECHANIC_MUTATION, {
		refetchQueries: [{ query: GET_MECHANICS_QUERY() }],
	});

	const { data: specialtiesData, loading: loadingSpecialties } = useQuery(GET_MECHANIC_SPECIALTIES_QUERY());

	const specialtyOptions = useMemo(() => {
		if (!specialtiesData?.mechanicSpecialties?.nodes) return [];
		return specialtiesData.mechanicSpecialties.nodes.map((node: any) => ({
			value: String(node.specialtyId),
			label: node.name,
		}));
	}, [specialtiesData]);

	const handleSubmit = async () => {
		if (!specialtyId) {
			toast.error(intl.formatMessage({ id: "mechanic.error.specialtyRequired", defaultMessage: "Seleccione una especialidad" }));
			return;
		}

		try {
			await mutateFunction({
				variables: {
					firstName,
					lastName,
					specialtyId: Number(specialtyId),
				},
			});

			toast.success(intl.formatMessage({ id: "mechanic.create.success", defaultMessage: "Mecánico creado correctamente" }));
			setFirstName("");
			setLastName("");
			setSpecialtyId("");
			if (onClose) onClose();
		} catch (err) {
			console.error("Error al guardar:", err);
			toast.error(intl.formatMessage({ id: "mechanic.create.error", defaultMessage: "Error al crear mecánico" }));
		}
	};

	return (
		<div title="">
			<div className="space-y-6">
				{/* First Name */}
				<div>
					<Label htmlFor="firstName_input">
						<FormattedMessage id="firstName" defaultMessage="Nombre" />
					</Label>
					<Input
						type="text"
						id="firstName_input"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
				</div>

				{/* Last Name */}
				<div>
					<Label htmlFor="lastName_input">
						<FormattedMessage id="lastName" defaultMessage="Apellido" />
					</Label>
					<Input
						type="text"
						id="lastName_input"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>

				{/* Specialty ID */}
				<div>
					<Label>
						<FormattedMessage id="specialtyId" defaultMessage="Especialidad" />
					</Label>
					<Select
						options={specialtyOptions}
						value={specialtyId}
						onChange={(val) => setSpecialtyId(val)}
						placeholder={loadingSpecialties ? "Cargando..." : "Seleccione una especialidad"}
					/>
				</div>

				<div className="flex flex-row justify-end">
					<button
						onClick={handleSubmit}
						disabled={saving}
						className="px-4 py-2 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
					>
						<FormattedMessage id="save" defaultMessage="Guardar" />
					</button>
				</div>
			</div>
		</div>
	);
}

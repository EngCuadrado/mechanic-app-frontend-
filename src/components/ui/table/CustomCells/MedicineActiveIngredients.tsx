import Badge from "../../badge/Badge";

const MedicineActiveIngredients = ({ row }: any) => {
	const ingredients = row.original.medicine_active_ingredients || [];

	return (
		<div className="flex flex-row items-center gap-2">
			{ingredients.map((item: any) => (
				<Badge variant={"solid"}>
					<div
						className="cursor-default"
						data-tooltip-id="global-tooltip" // <--- Debe coincidir con el ID en App.tsx
						data-tooltip-content={`${item.dose_value} ${item.dose_unit.abbreviation}`}
					>
						{item.active_ingredient.name}
					</div>
				</Badge>
			))}
		</div>
	);
};

export default MedicineActiveIngredients;

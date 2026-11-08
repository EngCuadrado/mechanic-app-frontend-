export interface ChecklistItem {
	itemId: number;
	name: string;
	inputType: string;
	options: string[] | null;
	isRequired: boolean;
}

export interface FormItem {
	item: ChecklistItem;
	value: string | null;
	notes: string | null;
}

export interface FormGroup {
	category: { name: string; sortOrder: number } | null;
	items: FormItem[];
}

export interface InspectionFormData {
	inspection: { vehicleInspectionId: number; inspectionType: string; mileage: number | null; inspectionNotes: string | null } | null;
	groups: FormGroup[];
}

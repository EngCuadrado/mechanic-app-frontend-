import { Step, StepLabel, Stepper } from "@mui/material";
import { useIntl } from "react-intl";
import { statusMessageId } from "../constants";

const FLOW = ["Recibido", "En proceso", "Listo", "Entregado"];

// Hereda el color del texto de Tailwind (claro/oscuro); verde en lo hecho, ámbar en el paso actual.
const SX = {
	color: "#1f2937",
	"html.dark &": { color: "rgb(255 255 255 / 0.9)" },
	"& .MuiStepLabel-labelContainer, & .MuiStepLabel-labelContainer .MuiStepLabel-label": { color: "inherit !important" },
	"& .MuiStepLabel-label": { color: "inherit !important", opacity: 0.75, fontSize: 12, marginTop: "6px !important" },
	"& .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": { color: "inherit !important", opacity: 1, fontWeight: 600 },
	"& .MuiStepIcon-root": { color: "#6b7280" },
	"html.dark & .MuiStepIcon-root": { color: "#4b5563" },
	"& .MuiStepIcon-root.Mui-active, html.dark & .MuiStepIcon-root.Mui-active": { color: "#d97706" },
	"& .MuiStepIcon-root.Mui-completed, html.dark & .MuiStepIcon-root.Mui-completed": { color: "#059669" },
	"& .MuiStepConnector-line": { borderColor: "#9ca3af" },
	"& .Mui-completed .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": { borderColor: "#059669" },
};

/** Progreso Recibido → Entregado (Stepper de MUI). Una orden cancelada no muestra avance. */
export default function StatusProgress({ status }: { status: string }) {
	const intl = useIntl();
	if (status === "Cancelado") return null;
	const current = FLOW.indexOf(status);
	return (
		<Stepper
			// Entregado es el último paso: se marca completo, no "en curso".
			activeStep={status === "Entregado" ? FLOW.length : current}
			alternativeLabel
			sx={SX}
			aria-label={intl.formatMessage({ id: "workOrder.progress", defaultMessage: "Progreso de la orden" })}
		>
			{FLOW.map((s) => (
				<Step key={s}>
					<StepLabel>{intl.formatMessage({ id: statusMessageId(s), defaultMessage: s })}</StepLabel>
				</Step>
			))}
		</Stepper>
	);
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { nicaDate } from "./dateUtils";

export interface SaleSummaryItem {
	name: string;
	quantity: number;
	price: number;
	total: number;
	presentation: string;
}

export interface SaleSummary {
	receiptNumber: string;
	receiptType: string;
	date: Date;
	customer: string;
	items: SaleSummaryItem[];
	subtotal: number;
	iva: number;
	grandTotal: number;
	totalPaid: number;
	changeDue: number;
}

export const generateSaleVoucherPDF = (
	saleData: SaleSummary,
	openInNewWindow: boolean = true,
) => {
	// Configuración de dimensiones POS (80mm)
	const pageWidth = 80;
	const margin = 5;

	// Cálculo dinámico de altura (aproximado en mm)
	// Base (encabezado/pie) + (filas * altura_fila) + margen de seguridad
	const headerHeight = 45;
	const footerHeight = 45;
	const estimatedRowHeight = 7; // Altura estimada por producto considerando saltos de línea
	const totalHeight =
		headerHeight +
		saleData.items.length * estimatedRowHeight +
		footerHeight;

	const doc = new jsPDF({
		unit: "mm",
		format: [pageWidth, totalHeight],
	});

	// Estilos globales
	doc.setFont("helvetica", "normal");
	const centerX = pageWidth / 2;

	// --- ENCABEZADO ---
	doc.setFontSize(12);
	doc.setFont("helvetica", "bold");
	doc.text("FARMACIA GUADALUPE", centerX, 10, { align: "center" });

	doc.setFontSize(8);
	doc.setFont("helvetica", "normal");
	// doc.text("DIRECCIÓN DEL NEGOCIO", centerX, 14, { align: "center" });
	// doc.text("TEL: +505 0000-0000", centerX, 18, { align: "center" });

	doc.setLineWidth(0.1);
	doc.line(margin, 22, pageWidth - margin, 22);

	doc.setFontSize(7);
	doc.text(`TICKET: ${saleData.receiptNumber}`, margin, 27);
	doc.text(`TIPO: ${saleData.receiptType}`, margin, 31);
	doc.text(
		`FECHA: ${nicaDate(saleData.date).format("DD/MM/YYYY hh:mm A")}`,
		margin,
		35,
	);
	doc.text(`CLIENTE: ${saleData.customer.toUpperCase()}`, margin, 39);

	// --- TABLA DE PRODUCTOS ---
	const tableColumn = ["CANT", "DESCRIPCIÓN", "TOTAL"];
	const tableRows = saleData.items.map((item) => [
		item.quantity.toString(),
		`${item.name} (${item.presentation})`,
		`C$${item.total.toFixed(2)}`,
	]);

	autoTable(doc, {
		startY: 43,
		head: [tableColumn],
		body: tableRows,
		theme: "plain",
		styles: {
			fontSize: 7,
			cellPadding: 1,
			overflow: "linebreak",
		},
		headStyles: {
			fontStyle: "bold",
			halign: "left",
			lineWidth: { bottom: 0.1 },
		},
		columnStyles: {
			0: { cellWidth: 10, halign: "center" },
			1: { cellWidth: "auto" },
			2: { cellWidth: 20, halign: "right" },
		},
		margin: { left: margin, right: margin },
	});

	const finalY = (doc as any).lastAutoTable.finalY || 43;

	// --- TOTALES ---
	doc.setLineWidth(0.1);
	doc.line(margin, finalY + 2, pageWidth - margin, finalY + 2);

	const totalsX = pageWidth - margin;
	doc.setFontSize(7);
	doc.text(`SUBTOTAL:`, margin + 30, finalY + 7);
	doc.text(`C$ ${saleData.subtotal.toFixed(2)}`, totalsX, finalY + 7, {
		align: "right",
	});

	doc.text(`IVA (15%):`, margin + 30, finalY + 11);
	doc.text(`C$ ${saleData.iva.toFixed(2)}`, totalsX, finalY + 11, {
		align: "right",
	});

	doc.setFont("helvetica", "bold");
	doc.setFontSize(8);
	doc.text(`TOTAL:`, margin + 30, finalY + 17);
	doc.text(`C$ ${saleData.grandTotal.toFixed(2)}`, totalsX, finalY + 17, {
		align: "right",
	});

	doc.setFont("helvetica", "normal");
	doc.setFontSize(7);
	doc.text(`PAGADO:`, margin + 30, finalY + 23);
	doc.text(`C$ ${saleData.totalPaid.toFixed(2)}`, totalsX, finalY + 23, {
		align: "right",
	});

	doc.text(`CAMBIO:`, margin + 30, finalY + 27);
	doc.text(
		`C$ ${Math.abs(saleData.changeDue).toFixed(2)}`,
		totalsX,
		finalY + 27,
		{ align: "right" },
	);

	// --- PIE DE PÁGINA ---
	doc.setFontSize(7);
	doc.setFont("helvetica", "italic");
	doc.text("¡Gracias por su compra!", centerX, finalY + 37, {
		align: "center",
	});
	doc.setFont("helvetica", "normal");
	doc.text("Favor conservar su ticket", centerX, finalY + 41, {
		align: "center",
	});

	if (openInNewWindow) {
		const blob = doc.output("blob");
		const url = URL.createObjectURL(blob);
		window.open(url, "_blank");
	} else {
		doc.save(`voucher_${saleData.receiptNumber}.pdf`);
	}
};

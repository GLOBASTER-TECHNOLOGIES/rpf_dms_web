import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateShiftPDF = (data: any) => {
  if (!data) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const timestamp = new Date().toLocaleString("en-IN");

  // --- 1. Header Section ---
  // Note: For the logo to work, 'rpf_logo.png' must be in your /public folder
  try {
    doc.addImage("/rpf_logo.png", "PNG", 15, 10, 25, 25);
  } catch (e) {
    console.error("Logo not found at /public/rpf_logo.png");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("RAILWAY PROTECTION FORCE", 45, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ministry of Railways, Government of India", 45, 23);

  doc.setFont("helvetica", "bold");
  doc.text(`SHIFT DETAIL REPORT: ${data.post || "N/A"}`, 45, 30);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(`Generated on: ${timestamp}`, pageWidth - 15, 15, {
    align: "right",
  });
  doc.text("CONFIDENTIAL", pageWidth - 15, 20, { align: "right" });

  doc.setLineWidth(0.5);
  doc.line(15, 38, pageWidth - 15, 38);

  // --- 2. Shift Metadata Table ---
  autoTable(doc, {
    startY: 42,
    head: [["DATE", "SHIFT NAME", "LOCATION", "STAFF COUNT"]],
    body: [
      [data.shiftDate, data.shiftName, data.post, data.officers?.length || 0],
    ],
    theme: "grid",
    headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: "bold" },
  });

  // --- 3. Briefing Section ---
  const finalY = (doc as any).lastAutoTable.finalY || 42;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. COMMANDERS BRIEFING", 15, finalY + 10);

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  const splitBriefing = doc.splitTextToSize(
    data.briefingDocument?.briefingScript || "No briefing provided.",
    pageWidth - 30,
  );
  doc.text(splitBriefing, 15, finalY + 17);

  // --- 4. Officers Table ---
  const briefingHeight = splitBriefing.length * 5;
  autoTable(doc, {
    startY: finalY + 20 + briefingHeight,
    head: [["#", "DEPLOYED PERSONNEL NAME", "FORCE NUMBER"]],
    body: data.officers?.map((o: any, i: number) => [
      i + 1,
      o.name,
      o.forceNumber || "N/A",
    ]),
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // --- 5. Instructions Table ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["DUTY INSTRUCTIONS", "DETAILS"]],
    body: data.instructions?.map((i: any) => [i.title, i.instruction]),
    columnStyles: { 0: { fontStyle: "bold", width: 50 } },
    theme: "grid",
  });

  // --- 6. Footer / Signatures ---
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.line(15, pageHeight - 30, 70, pageHeight - 30);
  doc.text("Duty Officer Signature", 15, pageHeight - 25);

  doc.line(pageWidth - 70, pageHeight - 30, pageWidth - 15, pageHeight - 30);
  doc.text("Post In-charge (IPF)", pageWidth - 70, pageHeight - 25);

  // --- 7. Download ---
  doc.save(`Shift_Report_${data.post}_${data.shiftDate}.pdf`);
};

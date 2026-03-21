import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- PROFESSIONAL COLOR THEME ---
const SLATE_900: [number, number, number] = [15, 23, 42]; // Primary Headers & Text
const SLATE_800: [number, number, number] = [30, 41, 59]; // Secondary Headers
const SLATE_600: [number, number, number] = [71, 85, 105]; // Subtext / Secondary Text
const SLATE_100: [number, number, number] = [241, 245, 249]; // Light Backgrounds
const INDIGO_600: [number, number, number] = [79, 70, 229]; // Accents / Primary Brand
const RED_600: [number, number, number] = [220, 38, 38]; // High Risk
const WHITE: [number, number, number] = [255, 255, 255];

// Helper to reliably load images in browser before adding to jsPDF
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
  });
};

function sectionHeader(doc: jsPDF, text: string, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Clean, modern section header style (light background, indigo accent)
  doc.setFillColor(...SLATE_100);
  doc.rect(14, y, pageWidth - 28, 8, "F");

  // Left accent line
  doc.setFillColor(...INDIGO_600);
  doc.rect(14, y, 2, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_800);
  doc.text(text.toUpperCase(), 20, y + 5.5);

  return y + 14;
}

function checkPageBreak(doc: jsPDF, y: number, needed = 25): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  // If the current Y + the space needed exceeds the bottom margin, trigger a new page
  if (y + needed > pageHeight - 20) {
    doc.addPage();
    return 20; // Return the starting Y coordinate for the new page
  }
  return y;
}

// Ensure the function is async so we can await the logo image loading
export const generateShiftPDF = async (data: any) => {
  if (!data) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  // ── 1. HEADER & BRANDING (White Background) ───────────────────────────
  try {
    // Awaiting the image guarantees jsPDF can grab the data before generating
    const logo = await loadImage("/rpf_logo.png");
    doc.addImage(logo, "PNG", 14, 8, 22, 22);
  } catch (error) {
    console.warn("Logo could not be loaded, proceeding without it.", error);
  }

  // "RAILWAY PROTECTION FORCE"
  doc.setTextColor(...SLATE_900);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RAILWAY PROTECTION FORCE", 40, 15);

  // Division Subtitle
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_600);
  doc.text(
    "Intelligence & Duty Reporting System • Tiruchchirappalli Division",
    40,
    21,
  );

  // "SHIFT OPERATIONS REPORT"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_900);
  doc.text(`SHIFT OPERATIONS REPORT`, 40, 28);

  // Timestamp
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_600);
  doc.text(`Generated: ${timestamp}`, pageWidth - 14, 28, { align: "right" });

  // Subtle header divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(14, 34, pageWidth - 14, 34);

  // ── 2. METADATA ROW ─────────────────────────────────────────────
  let y = 42;
  autoTable(doc, {
    startY: y,
    head: [["SHIFT DATE", "SHIFT TYPE", "POST / LOCATION", "TOTAL PERSONNEL"]],
    body: [
      [
        data.shiftDate || "—",
        data.shiftName ? `${data.shiftName.toUpperCase()} SHIFT` : "—",
        data.post || "—",
        data.officers?.length || 0,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: SLATE_100,
      textColor: SLATE_600,
      fontStyle: "bold",
      fontSize: 7,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: "bold",
      textColor: SLATE_800,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 3. COMMANDER's BRIEFING ───────────────────────────────────
  y = checkPageBreak(doc, y, 45);
  y = sectionHeader(doc, "1. SO's Briefing Script", y);
  const script =
    data.briefingDocument?.briefingScript ||
    "No briefing script recorded for this shift.";

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_600);

  const splitScript = doc.splitTextToSize(`"${script}"`, pageWidth - 28);
  doc.text(splitScript, 14, y);
  y += splitScript.length * 5 + 10;

  // ── 4. DEPLOYED PERSONNEL ────────────────────────────────────
  y = checkPageBreak(doc, y, 50);
  y = sectionHeader(doc, "2. Deployed Personnel", y);

  if (data.officers?.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["#", "OFFICER NAME", "FORCE NUMBER", "RANK", "ASSIGNMENT"]],
      body: data.officers.map((o: any, i: number) => [
        i + 1,
        o.name || "—",
        o.forceNumber || "—",
        o.rank || "—",
        o.postCode || data.post || "—",
      ]),
      theme: "plain",
      headStyles: {
        fillColor: SLATE_900,
        textColor: WHITE,
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: SLATE_800,
        lineColor: [226, 232, 240],
        lineWidth: 0.1, // ✅ correct property
      },
      alternateRowStyles: { fillColor: SLATE_100 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_600);
    doc.text("No personnel records found.", 14, y);
    y += 12;
  }

  // ── 5. DUTY INSTRUCTIONS ─────────────────────────────────────
  y = checkPageBreak(doc, y, 50);
  y = sectionHeader(doc, "3. Standard Duty Instructions", y);

  if (data.instructions?.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["TITLE", "INSTRUCTION DETAILS", "VALIDITY"]],
      body: data.instructions.map((ins: any) => {
        const from = ins.validFrom
          ? new Date(ins.validFrom).toLocaleDateString("en-IN")
          : "—";
        const to = ins.validTo
          ? new Date(ins.validTo).toLocaleDateString("en-IN")
          : "—";
        return [ins.title || "—", ins.instruction || "—", `${from} to ${to}`];
      }),
      theme: "grid",
      headStyles: { fillColor: SLATE_900, textColor: WHITE, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: SLATE_800 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: "bold" },
        1: { cellWidth: 90 },
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_600);
    doc.text("No active instructions for this shift.", 14, y);
    y += 12;
  }

  // ── 6. CRIME INTELLIGENCE ────────────────────────────────────
  y = checkPageBreak(doc, y, 50);
  y = sectionHeader(doc, "4. Risk Analysis & Intelligence", y);

  if (data.crimeIntel?.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["TRAIN", "RISK LEVEL", "REQUIRED ACTION"]],
      body: data.crimeIntel.map((c: any) => [
        `Train ${c.trainNumber || "—"}`,
        c.riskLevel || "—",
        c.primaryDutyAction || "—",
      ]),
      theme: "grid",
      headStyles: { fillColor: INDIGO_600, textColor: WHITE, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: SLATE_800 },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: "bold" },
        1: { cellWidth: 35, fontStyle: "bold", textColor: RED_600 },
        2: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_600);
    doc.text("No active crime intelligence alerts for this shift.", 14, y);
    y += 12;
  }

  // ── 7. POST-SHIFT DEBRIEFS ───────────────────────────────────
  // High threshold (70) ensures the Section Header + First Officer Block don't split
  y = checkPageBreak(doc, y, 70);
  y = sectionHeader(doc, "5. Officer Post-Shift Debriefs", y);

  if (data.debriefs?.length > 0) {
    data.debriefs.forEach((d: any) => {
      // High threshold (50) ensures the Officer Header + AutoTable head stay together
      y = checkPageBreak(doc, y, 50);

      const officerName = d.staffId?.name || "Unknown Officer";
      const forceNo = d.staffId?.forceNumber || "N/A";
      const rank = d.staffId?.rank || "";

      // Officer Header Block
      doc.setFillColor(...SLATE_100);
      doc.rect(14, y, pageWidth - 28, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...SLATE_800);
      doc.text(
        `OFFICER: ${officerName.toUpperCase()}  |  ${rank.toUpperCase()}  |  ID: ${forceNo}`,
        16,
        y + 5.5,
      );

      y += 10;

      if (d.reports && d.reports.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [
            [
              "TRAIN/TIME",
              "SUMMARY / TRANSCRIPT",
              "OBSERVATIONS",
              "IMPROVEMENTS",
            ],
          ],
          body: d.reports.map((r: any) => {
            const time = r.submittedAt
              ? new Date(r.submittedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—";
            const trainStr =
              r.trainNo || r.trainNumber
                ? `Train ${r.trainNo || r.trainNumber}\n${time}`
                : time;

            let textContent = "";
            if (r.transcript) textContent += `TRANSCRIPT:\n${r.transcript}\n\n`;
            if (r.summary) textContent += `SUMMARY:\n${r.summary}`;
            if (!textContent) textContent = "—";

            return [
              trainStr,
              textContent.trim(),
              r.observations || "—",
              r.improvements || "—",
            ];
          }),
          theme: "grid",
          headStyles: {
            fillColor: [226, 232, 240], // Light Gray Header
            textColor: SLATE_900,
            fontSize: 7.5,
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 8, textColor: SLATE_600, valign: "top" },
          columnStyles: {
            0: { cellWidth: 25, fontStyle: "bold", textColor: SLATE_800 },
            1: { cellWidth: 60 },
            2: { cellWidth: 48 },
            3: { cellWidth: 48 },
          },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(...SLATE_600);
        doc.text("No specific train reports logged.", 16, y + 3);
        y += 10;
      }
    });
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_600);
    doc.text("No debriefs have been submitted for this shift yet.", 14, y);
    y += 12;
  }

  // ── 8. SIGNATURE BLOCK ───────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y += 20;

  doc.setDrawColor(...SLATE_600);
  doc.setLineWidth(0.2);

  // Left Signature
  doc.line(14, y, 70, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_800);
  doc.text("Duty Officer Signature", 14, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...SLATE_600);
  doc.text("Name / Rank / Date", 14, y + 9);

  // Right Signature
  doc.line(pageWidth - 70, y, pageWidth - 14, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_800);
  doc.text("Post In-charge (IPF)", pageWidth - 70, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...SLATE_600);
  doc.text("Name / Rank / Date", pageWidth - 70, y + 9);

  // ── 9. FOOTER & PAGE NUMBERS ─────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top border line for footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(7);
    doc.setTextColor(...SLATE_600);

    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 6, {
      align: "center",
    });

    doc.text("Intelligence & Duty Reporting System", 14, pageHeight - 6);

    doc.text("RESTRICTED CIRCULATION", pageWidth - 14, pageHeight - 6, {
      align: "right",
    });
  }

  // Save the PDF
  const safePost = (data.post || "UNKNOWN").replace(/\s+/g, "");
  const safeShift = (data.shiftName || "SHIFT").replace(/\s+/g, "");
  doc.save(`ShiftReport_${safePost}_${safeShift}.pdf`);
};

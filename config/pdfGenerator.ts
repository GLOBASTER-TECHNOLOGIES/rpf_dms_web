import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- PROFESSIONAL COLOR THEME ---
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_800: [number, number, number] = [30, 41, 59];
const SLATE_600: [number, number, number] = [71, 85, 105];
const SLATE_100: [number, number, number] = [241, 245, 249];
const INDIGO_600: [number, number, number] = [79, 70, 229];
const RED_600: [number, number, number] = [220, 38, 38];
const WHITE: [number, number, number] = [255, 255, 255];
const BORDER_COLOR: [number, number, number] = [226, 232, 240];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
  });
};

/**
 * Dynamically fetches a .ttf font file and converts it to Base64
 * so jsPDF can embed it for multi-language (Unicode) support.
 */
const loadFontAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch font at ${url}`);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Notice: Added fontName parameter here so headers use the correct language font
function sectionHeader(
  doc: jsPDF,
  text: string,
  y: number,
  fontName: string,
): number {
  doc.setFont(fontName, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...SLATE_900);
  doc.text(text.toUpperCase(), 14, y + 6);

  const textWidth = doc.getTextWidth(text.toUpperCase());
  doc.setFillColor(...INDIGO_600);
  doc.rect(14, y + 8.5, textWidth, 1.5, "F");

  return y + 14;
}

function checkPageBreak(doc: jsPDF, y: number, needed = 25): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 20) {
    doc.addPage();
    return 16;
  }
  return y;
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export const generateShiftPDF = async (data: any) => {
  if (!data) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Define font tracking
  const CUSTOM_FONT = "CustomUnicodeFont";
  const FALLBACK_FONT = "helvetica";
  let activeFont = FALLBACK_FONT;

  // ── 0. LOAD MULTI-LANGUAGE FONT ────────────────────────────────────────────
  try {
    // Make sure this matches the exact filename in your public folder!
    const fontBase64 = await loadFontAsBase64("/Arial Unicode MS.ttf");

    doc.addFileToVFS("ArialUnicode.otf", fontBase64);
    doc.addFont("ArialUnicode.otf", CUSTOM_FONT, "normal");
    doc.addFont("ArialUnicode.otf", CUSTOM_FONT, "bold");

    activeFont = CUSTOM_FONT;
  } catch (err) {
    console.warn("Unicode font failed to load. Falling back to default.", err);
  }

  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  // ── 1. HEADER & BRANDING ───────────────────────────────────────────────────
  try {
    const logo = await loadImage("/rpf_logo.png");
    doc.addImage(logo, "PNG", 14, 10, 24, 24);
  } catch {
    console.warn("Logo could not be loaded. Continuing without logo.");
  }

  doc.setTextColor(...SLATE_900);
  doc.setFont(activeFont, "bold"); // Replaced "helvetica" with activeFont
  doc.setFontSize(16);
  doc.text("RAILWAY PROTECTION FORCE", 42, 16);

  doc.setFontSize(9.5);
  doc.setFont(activeFont, "normal");
  doc.setTextColor(...SLATE_600);
  doc.text(
    "Intelligence & Duty Reporting System • Tiruchchirappalli Division",
    42,
    22,
  );

  doc.setFont(activeFont, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_900);
  doc.text("SHIFT OPERATIONS REPORT", 42, 30);

  doc.setFont(activeFont, "italic");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_600);
  doc.text(`Generated: ${timestamp}`, pageWidth - 14, 30, { align: "right" });

  doc.setDrawColor(...BORDER_COLOR);
  doc.line(14, 38, pageWidth - 14, 38);

  let y = 44;

  // ── 2. METADATA ROW ────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    head: [["SHIFT DATE", "SHIFT TYPE", "POST / LOCATION", "TOTAL PERSONNEL"]],
    body: [
      [
        data.shiftDate || "—",
        data.shiftName ? `${data.shiftName.toUpperCase()} SHIFT` : "—",
        data.post || "—",
        data.officers?.length || "0",
      ],
    ],
    theme: "grid",
    styles: { font: activeFont }, // Inject font into table
    headStyles: {
      fillColor: SLATE_100,
      textColor: SLATE_600,
      fontStyle: "bold",
      fontSize: 8,
      lineColor: BORDER_COLOR,
      lineWidth: 0.1,
    },
    bodyStyles: {
      fontSize: 10,
      fontStyle: "bold",
      textColor: SLATE_800,
      lineColor: BORDER_COLOR,
      lineWidth: 0.1,
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 3. SO'S BRIEFING ──────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "1. SO's Briefing Script", y, activeFont);

  const script =
    data.briefingDocument?.briefingScript ||
    "No briefing script recorded for this shift.";

  doc.setFont(activeFont, "italic");
  doc.setFontSize(10);
  doc.setTextColor(...SLATE_800);

  const splitScript = doc.splitTextToSize(`"${script}"`, pageWidth - 28);
  doc.text(splitScript, 14, y);

  y += splitScript.length * 5 + 10;

  // ── 4. DEPLOYED PERSONNEL ─────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "2. Deployed Personnel", y, activeFont);

  if (data.officers && data.officers.length > 0) {
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
      styles: { font: activeFont }, // Inject font into table
      headStyles: {
        fillColor: SLATE_900,
        textColor: WHITE,
        fontSize: 8.5,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9.5,
        textColor: SLATE_800,
        lineColor: BORDER_COLOR,
        lineWidth: 0.1,
      },
      alternateRowStyles: { fillColor: SLATE_100 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFont(activeFont, "italic");
    doc.setFontSize(9);
    doc.text("No personnel deployed.", 14, y);
    y += 12;
  }

  // ── 5. DUTY INSTRUCTIONS ──────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "3. Standard Duty Instructions", y, activeFont);

  if (data.instructions && data.instructions.length > 0) {
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
      styles: { font: activeFont, overflow: "linebreak", cellPadding: 4 }, // Inject font into table
      headStyles: { fillColor: SLATE_900, textColor: WHITE, fontSize: 8.5 },
      bodyStyles: { fontSize: 9.5, textColor: SLATE_800, valign: "top" },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: "bold", textColor: SLATE_900 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 42 },
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFont(activeFont, "italic");
    doc.setFontSize(9);
    doc.text("No instructions recorded.", 14, y);
    y += 12;
  }

  // ── 6. CRIME INTELLIGENCE ─────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "4. Risk Analysis & Intelligence", y, activeFont);

  if (data.crimeIntel && data.crimeIntel.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["TRAIN", "RISK LEVEL", "REQUIRED ACTION"]],
      body: data.crimeIntel.map((c: any) => [
        `Train ${c.trainNumber || "—"}`,
        c.riskLevel || "—",
        c.primaryDutyAction || "—",
      ]),
      theme: "grid",
      styles: { font: activeFont, overflow: "linebreak", cellPadding: 4 }, // Inject font into table
      headStyles: { fillColor: INDIGO_600, textColor: WHITE, fontSize: 8.5 },
      bodyStyles: { fontSize: 9.5, textColor: SLATE_800, valign: "top" },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: "bold" },
        1: { cellWidth: 35, fontStyle: "bold", textColor: RED_600 },
        2: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFont(activeFont, "italic");
    doc.setFontSize(9);
    doc.text("No intelligence data recorded.", 14, y);
    y += 12;
  }

  // ── 7. POST-SHIFT DEBRIEFS ────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 35);
  y = sectionHeader(doc, "5. Officer Post-Shift Debriefs", y, activeFont);

  if (data.debriefs && data.debriefs.length > 0) {
    data.debriefs.forEach((d: any) => {
      y = checkPageBreak(doc, y, 40);

      doc.setFillColor(...SLATE_100);
      doc.rect(14, y, pageWidth - 28, 8, "F");
      doc.setFont(activeFont, "bold");
      doc.setFontSize(9);
      doc.setTextColor(...SLATE_800);

      const officerName = (d.staffId?.name || "Unknown").toUpperCase();
      const officerRank = (d.staffId?.rank || "Rank N/A").toUpperCase();
      const officerId = d.staffId?.forceNumber || "ID N/A";

      doc.text(
        `OFFICER: ${officerName}  |  ${officerRank}  |  ID: ${officerId}`,
        16,
        y + 5.5,
      );
      y += 10;

      if (d.reports && d.reports.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [
            [
              "TRAIN / TIME",
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

            return [
              trainStr,
              textContent.trim() || "—",
              r.observations || "—",
              r.improvements || "—",
            ];
          }),
          theme: "grid",
          styles: { font: activeFont, overflow: "linebreak", cellPadding: 4 }, // Inject font into table
          headStyles: {
            fillColor: BORDER_COLOR,
            textColor: SLATE_900,
            fontSize: 8,
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 9, textColor: SLATE_600, valign: "top" },
          columnStyles: {
            0: { cellWidth: 28, fontStyle: "bold", textColor: SLATE_800 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 40 },
            3: { cellWidth: 40 },
          },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      } else {
        doc.setFont(activeFont, "italic");
        doc.setFontSize(9);
        doc.text("No reports submitted by this officer.", 14, y);
        y += 12;
      }
    });
  } else {
    doc.setFont(activeFont, "italic");
    doc.setFontSize(9);
    doc.text("No debriefs recorded.", 14, y);
    y += 12;
  }

  // ── 8. SIGNATURE BLOCK ────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y += 20;

  doc.setDrawColor(...SLATE_600);
  doc.setLineWidth(0.2);

  // Duty Officer
  doc.line(14, y, 70, y);
  doc.setFont(activeFont, "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_800);
  doc.text("Duty Officer Signature", 14, y + 5);
  doc.setFont(activeFont, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_600);
  doc.text("Name / Rank / Date", 14, y + 9);

  // Post In-charge
  doc.line(pageWidth - 70, y, pageWidth - 14, y);
  doc.setFont(activeFont, "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_800);
  doc.text("Post In-charge (IPF)", pageWidth - 70, y + 5);
  doc.setFont(activeFont, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_600);
  doc.text("Name / Rank / Date", pageWidth - 70, y + 9);

  // ── 9. FOOTER & PAGE NUMBERS ──────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(8);
    doc.setTextColor(...SLATE_600);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 6, {
      align: "center",
    });
    doc.text("RPF DMS System", 14, pageHeight - 6);
  }

  // Save the document
  const safePost = (data.post || "UNKNOWN").replace(/\s+/g, "");
  const safeShift = (data.shiftName || "SHIFT").replace(/\s+/g, "");
  doc.save(`ShiftReport_${safePost}_${safeShift}.pdf`);
};

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

const detectFont = (text: string): string => {
  if (!text) return "helvetica";
  if (/[\u0B80-\u0BFF]/.test(text)) return "NotoSansTamil";
  if (/[\u0D00-\u0D7F]/.test(text)) return "NotoSansMalayalam";
  if (/[\u0900-\u097F]/.test(text)) return "NotoSansDevanagari";
  return "helvetica";
};

// 🌟 FIX 1: Stricter Text Formatter to prevent "apk)" splits & clean encoding bugs
const formatCellText = (text: string): string => {
  if (!text) return "—";
  let cleanText = String(text)
    // Aggressively clean up mojibake encoding artifacts (ðØ)
    .replace(/ðØ/g, "•")
    .replace(/ð/g, "•") // Catch stray 'eth' characters often left behind
    .replace(/Ø/g, "")
    .replace(/[\u00A0]/g, " ")
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ");

  // FIX: Added \b (word boundary). It will detect " a)" but ignore "apk)"
  cleanText = cleanText.replace(
    /([^\n])\s*(•|-|\b\d+[\)\.]|\b[a-zA-Z]\)|\b[ivx]+\))\s+/gi,
    "$1\n$2 ",
  );
  return cleanText.trim();
};

// 🌟 FIX 2: Stricter regex in the Mixed-Content Parser
const parseBriefingScript = (
  text: string,
): { content: string; isList: boolean }[] => {
  if (!text) return [];

  let cleanText = formatCellText(text);
  const blocks = cleanText
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const finalBlocks: { content: string; isList: boolean }[] = [];
  // Also strictly requires word boundaries for list detection here
  const listRegex = /^(?:•|-|\b\d+[\)\.]|\b[a-zA-Z]\)|\b[ivx]+\))\s/i;

  blocks.forEach((block) => {
    const isList = listRegex.test(block);

    if (finalBlocks.length === 0) {
      finalBlocks.push({ content: block, isList });
    } else {
      const prevBlock = finalBlocks[finalBlocks.length - 1];
      if (isList || /[.:?!]$/.test(prevBlock.content)) {
        finalBlocks.push({ content: block, isList });
      } else {
        prevBlock.content += " " + block;
      }
    }
  });

  return finalBlocks;
};

// Precise 0.6 thickness underline everywhere
function sectionHeader(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_900);
  const sectionTitle = text.toUpperCase();
  doc.text(sectionTitle, 14, y + 6);

  const titleWidth = doc.getTextWidth(sectionTitle);
  doc.setDrawColor(...INDIGO_600);
  doc.setLineWidth(0.6);
  doc.line(14, y + 7.5, 14 + titleWidth, y + 7.5);

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

  // ── 0. LOAD REGIONAL FONTS ──────────────────────────────────────────────────
  const fontsToLoad = [
    { url: "/NotoSansDevanagari-Regular.ttf", name: "NotoSansDevanagari" },
    { url: "/NotoSansMalayalam-Regular.ttf", name: "NotoSansMalayalam" },
    { url: "/NotoSansTamil-Regular.ttf", name: "NotoSansTamil" },
  ];

  for (const font of fontsToLoad) {
    try {
      const fontBase64 = await loadFontAsBase64(font.url);
      doc.addFileToVFS(`${font.name}.ttf`, fontBase64);
      doc.addFont(`${font.name}.ttf`, font.name, "normal");
      doc.addFont(`${font.name}.ttf`, font.name, "bold");
      doc.addFont(`${font.name}.ttf`, font.name, "italic");
    } catch (err) {
      console.warn(`Failed to load ${font.name}.`, err);
    }
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
    console.warn("Logo could not be loaded.");
  }

  doc.setTextColor(...SLATE_900);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RAILWAY PROTECTION FORCE", 42, 16);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_600);
  doc.text(
    "Intelligence & Duty Reporting System • Tiruchchirappalli Division",
    42,
    22,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_900);
  doc.text("SHIFT OPERATIONS REPORT", 42, 30);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_600);
  doc.text(`Generated: ${timestamp}`, pageWidth - 14, 30, { align: "right" });

  doc.setDrawColor(...BORDER_COLOR);
  doc.line(14, 38, pageWidth - 14, 38);

  let y = 44;

  const applyFontToCell = (data: any) => {
    if (data.cell.text && data.cell.text.length > 0) {
      const cellText = Array.isArray(data.cell.text)
        ? data.cell.text.join(" ")
        : data.cell.text;
      data.cell.styles.font = detectFont(cellText);
    }
  };

  // ── 2. METADATA ROW ────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    head: [["SHIFT DATE", "SHIFT TYPE", "POST", "TOTAL PERSONNEL"]],
    body: [
      [
        data.shiftDate || "—",
        data.shiftName ? `${data.shiftName.toUpperCase()} SHIFT` : "—",
        data.post || "—",
        data.officers?.length || "0",
      ],
    ],
    theme: "grid",
    didParseCell: applyFontToCell,
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

  // ── 3. SO'S BRIEFING ────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "1. SO's Briefing Script", y);

  const rawScript =
    data.briefingDocument?.briefingScript ||
    "No briefing script recorded for this shift.";
  const scriptBlocks = parseBriefingScript(rawScript);
  const briefingRows: any[] = [];

  const marginLeft = 14;
  const marginRight = 14;
  const tableWidth = pageWidth - marginLeft - marginRight;

  scriptBlocks.forEach((block) => {
    briefingRows.push([
      {
        content: block.content,
        styles: {
          fillColor: WHITE,
          textColor: SLATE_800,
          fontStyle: "normal",
          fontSize: 9.5,
          lineHeightFactor: 1.5,
          overflow: "linebreak", // ✅ wrap instead of clip
          cellWidth: tableWidth, // ✅ explicit width on the cell itself
          cellPadding: {
            top: 3,
            bottom: 3,
            left: block.isList ? 20 : 10,
            right: 10, // ✅ right padding so text doesn't hug border
          },
        },
      },
    ]);
  });

  if (briefingRows.length > 0) {
    autoTable(doc, {
      startY: y,
      body: briefingRows,
      theme: "plain",

      styles: {
        overflow: "linebreak", // ✅ global fallback
        cellPadding: { top: 3, bottom: 3, left: 10, right: 10 },
      },

      columnStyles: {
        0: {
          cellWidth: tableWidth, // ✅ strict column width
          overflow: "linebreak",
        },
      },

      tableWidth: tableWidth,

      margin: { left: marginLeft, right: marginRight },

      didParseCell: applyFontToCell,
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_600);
    doc.text("No briefing script recorded.", 14, y);
    y += 12;
  }

  // ── 4. DEPLOYED PERSONNEL ─────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "2. Deployed Personnel", y);

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
      didParseCell: applyFontToCell,
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
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("No personnel deployed.", 14, y);
    y += 12;
  }

  // ── 5. DUTY INSTRUCTIONS ──────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "3. STANDARD DUTY INSTRUCTIONS", y);

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
        const validity = `${from}\nto\n${to}`;

        const formattedInstructions = formatCellText(ins.instruction);

        return [
          {
            content: ins.title?.toUpperCase() || "—",
            styles: { fontStyle: "bold" },
          },
          formattedInstructions,
          validity,
        ];
      }),
      theme: "grid",
      styles: {
        overflow: "linebreak",
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8.5 },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85], valign: "top" },
      columnStyles: {
        0: { cellWidth: 35, fillColor: [250, 251, 252] },
        1: { cellPadding: { top: 5, right: 8, bottom: 5, left: 5 } },
        2: { cellWidth: 28, halign: "center" },
      },
      margin: { left: 14, right: 14 },
      rowPageBreak: "auto",
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("No instructions recorded.", 14, y);
    y += 10;
  }

  // ── 6. CRIME INTELLIGENCE ─────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "4. Risk Analysis & Intelligence", y);

  if (data.crimeIntel && data.crimeIntel.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["TRAIN", "RISK LEVEL", "REQUIRED ACTION"]],
      body: data.crimeIntel.map((c: any) => [
        `Train ${c.trainNumber || "—"}`,
        c.riskLevel || "—",
        formatCellText(c.primaryDutyAction),
      ]),
      theme: "grid",
      styles: { overflow: "linebreak", cellPadding: 4 },
      didParseCell: applyFontToCell,
      headStyles: { fillColor: INDIGO_600, textColor: WHITE, fontSize: 8.5 },
      bodyStyles: { fontSize: 9.5, textColor: SLATE_800, valign: "top" },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: "bold" },
        1: { cellWidth: 35, fontStyle: "bold", textColor: RED_600 },
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("No intelligence data recorded.", 14, y);
    y += 12;
  }

  // ── 7. POST-SHIFT DEBRIEFS ────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 35);
  y = sectionHeader(doc, "5. Officer Post-Shift Debriefs", y);

  if (data.debriefs && data.debriefs.length > 0) {
    data.debriefs.forEach((d: any) => {
      y = checkPageBreak(doc, y, 40);

      doc.setFillColor(...SLATE_100);
      doc.rect(14, y, pageWidth - 28, 8, "F");

      const officerName = (d.staffId?.name || "Unknown").toUpperCase();
      const officerRank = (d.staffId?.rank || "Rank N/A").toUpperCase();
      const officerId = d.staffId?.forceNumber || "ID N/A";
      const headerStr = `OFFICER: ${officerName}  |  ${officerRank}  |  ID: ${officerId}`;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...SLATE_800);
      doc.text(headerStr, 16, y + 5.5);
      y += 10;

      if (d.reports && d.reports.length > 0) {
        const bodyRows: any[] = [];

        d.reports.forEach((r: any) => {
          const time = r.submittedAt
            ? new Date(r.submittedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—";
          const trainStr =
            r.trainNo || r.trainNumber
              ? `TRAIN ${r.trainNo || r.trainNumber}   •   ${time}`
              : time;
          const finalSummary =
            r.summary || (r.transcript && !r.summary ? r.observations : null);

          bodyRows.push([
            {
              content: trainStr,
              colSpan: 2,
              styles: {
                fillColor: [241, 245, 249],
                textColor: [15, 23, 42],
                fontStyle: "bold",
                fontSize: 9.5,
                halign: "left",
                valign: "middle",
                cellPadding: { top: 3, bottom: 2, left: 14, right: 14 },
              },
            },
          ]);

          bodyRows.push([
            {
              content: "TRANSCRIPT",
              styles: {
                font: "helvetica",
                fontStyle: "bold",
                fontSize: 7.5,
                textColor: [100, 116, 139],
                cellPadding: { top: 4, bottom: 3, left: 14, right: 14 },
              },
            },
            {
              content: "SUMMARY",
              styles: {
                font: "helvetica",
                fontStyle: "bold",
                fontSize: 7.5,
                textColor: [100, 116, 139],
                cellPadding: { top: 4, bottom: 3, left: 14, right: 14 },
              },
            },
          ]);

          bodyRows.push([
            {
              content: r.transcript ? formatCellText(r.transcript) : "—",
              styles: {
                font: detectFont(r.transcript),
                textColor: [30, 41, 59],
                fontSize: 9,
                cellPadding: { top: 2, bottom: 5, left: 14, right: 14 },
              },
            },
            {
              content: finalSummary ? formatCellText(finalSummary) : "—",
              styles: {
                font: "helvetica",
                textColor: [30, 41, 59],
                fontSize: 9,
                cellPadding: { top: 2, bottom: 5, left: 14, right: 14 },
              },
            },
          ]);

          bodyRows.push([
            {
              content: "OBSERVATIONS",
              styles: {
                font: "helvetica",
                fontStyle: "bold",
                fontSize: 7.5,
                textColor: [100, 116, 139],
                cellPadding: { top: 4, bottom: 3, left: 14, right: 14 },
              },
            },
            {
              content: "IMPROVEMENTS",
              styles: {
                font: "helvetica",
                fontStyle: "bold",
                fontSize: 7.5,
                textColor: [100, 116, 139],
                cellPadding: { top: 4, bottom: 3, left: 14, right: 14 },
              },
            },
          ]);

          bodyRows.push([
            {
              content: r.observations ? formatCellText(r.observations) : "—",
              styles: {
                font: "helvetica",
                textColor: [30, 41, 59],
                fontSize: 9,
                cellPadding: { top: 2, bottom: 5, left: 14, right: 14 },
              },
            },
            {
              content: r.improvements ? formatCellText(r.improvements) : "—",
              styles: {
                font: "helvetica",
                textColor: [30, 41, 59],
                fontSize: 9,
                cellPadding: { top: 2, bottom: 5, left: 14, right: 14 },
              },
            },
          ]);
        });

        const halfWidth = (pageWidth - 28) / 2;

        autoTable(doc, {
          startY: y,
          body: bodyRows,
          theme: "grid",
          styles: {
            overflow: "linebreak",
            lineColor: BORDER_COLOR,
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: halfWidth },
            1: { cellWidth: halfWidth },
          },
          margin: { left: 14, right: 14 },
        });

        y = (doc as any).lastAutoTable.finalY + 12;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("No reports submitted by this officer.", 14, y);
        y += 12;
      }
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("No debriefs recorded.", 14, y);
    y += 12;
  }

  // ── 8. SIGNATURE BLOCK ────────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y += 20;

  doc.setDrawColor(...SLATE_600);
  doc.setLineWidth(0.2);

  doc.line(14, y, 70, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_800);
  doc.text("Duty Officer Signature", 14, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_600);
  doc.text("Name / Rank / Date", 14, y + 9);

  doc.line(pageWidth - 70, y, pageWidth - 14, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_800);
  doc.text("Post In-charge (IPF)", pageWidth - 70, y + 5);
  doc.setFont("helvetica", "normal");
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
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 6, {
      align: "center",
    });
    doc.text("RPF DMS System", 14, pageHeight - 6);
  }

  const safePost = (data.post || "UNKNOWN").replace(/\s+/g, "");
  const safeShift = (data.shiftName || "SHIFT").replace(/\s+/g, "");
  doc.save(`${data.shiftDate}_${safePost}_${safeShift}.pdf`);
};

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
  // Tamil Unicode Range
  if (/[\u0B80-\u0BFF]/.test(text)) return "NotoSansTamil";
  // Malayalam Unicode Range
  if (/[\u0D00-\u0D7F]/.test(text)) return "NotoSansMalayalam";
  // Devanagari (Hindi) Unicode Range
  if (/[\u0900-\u097F]/.test(text)) return "NotoSansDevanagari";

  return "helvetica";
};

// Precise 0.6 thickness underline everywhere
function sectionHeader(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_900);
  const sectionTitle = text.toUpperCase();
  doc.text(sectionTitle, 14, y + 6);

  // Precise Underline
  const titleWidth = doc.getTextWidth(sectionTitle);
  doc.setDrawColor(...INDIGO_600); // 79, 70, 229
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

  // Smart Cell Font hook: Checks the language of each cell and assigns the correct font
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

  // ── 3. SO'S BRIEFING (✨ IMPROVED PARSER & STYLING) ────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, "1. SO's Briefing Script", y);

  const script =
    data.briefingDocument?.briefingScript ||
    "No briefing script recorded for this shift.";

  // Smart parsing: Add newlines before numbered list items if they are bunched up on the same line
  const cleanScript = script
    .replace(/([^\n])(\s*\b\d+[\)\.]\s)/g, "$1\n$2")
    .trim();

  // Split into individual points based on the numbered markers
  const rawPoints = cleanScript
    .split(/(?=(?:^|\n)\s*\d+[\)\.]\s)/g)
    .map((p: string) => p.trim())
    .filter(Boolean);
  const scriptPoints: { title: string; body: string }[] = [];

  // Check if the text actually utilizes a numbered list format
  const isNumberedList =
    rawPoints.length > 0 && /^\d+[\)\.]/.test(rawPoints[0]);

  if (isNumberedList) {
    rawPoints.forEach((pt: string) => {
      const newlineIdx = pt.indexOf("\n");
      if (newlineIdx !== -1) {
        // Point has a natural line break. Treat first line as title.
        scriptPoints.push({
          title: pt.substring(0, newlineIdx).trim(),
          body: pt.substring(newlineIdx + 1).trim(),
        });
      } else {
        // Inline point without line breaks. Try to detect a title separated by colon or dash.
        const match = pt.match(/^(\d+[\)\.]\s*[^a-z\n]+?)(?:--|:|-)(.*)$/);
        if (match && match[1].length > 3) {
          scriptPoints.push({ title: match[1].trim(), body: match[2].trim() });
        } else {
          scriptPoints.push({ title: "", body: pt });
        }
      }
    });
  } else {
    // Not a numbered list, simply split into paragraphs
    cleanScript
      .split(/\n+/)
      .filter(Boolean)
      .forEach((b: string) => scriptPoints.push({ title: "", body: b }));
  }

  const briefingRows: any[] = [];

  // Construct autoTable rows for the Briefing Script
  scriptPoints.forEach((sp) => {
    if (sp.title) {
      briefingRows.push([
        {
          content: sp.title,
          styles: {
            fillColor: SLATE_100, // Light slate background for titles
            textColor: SLATE_900,
            fontStyle: "bold",
            fontSize: 9.5,
            cellPadding: { top: 4, bottom: 4, left: 10, right: 10 },
          },
        },
      ]);
    }
    if (sp.body) {
      briefingRows.push([
        {
          content: sp.body,
          styles: {
            fillColor: WHITE,
            textColor: SLATE_800,
            fontStyle: "normal", // No more dense italics
            fontSize: 9.5,
            lineHeightFactor: 1.5, // Much better line height for readability
            // Link spacing: less top padding if it follows a title, more bottom padding to separate points
            cellPadding: {
              top: sp.title ? 2 : 5,
              bottom: 8,
              left: 10,
              right: 10,
            },
          },
        },
      ]);
    }
  });

  if (briefingRows.length > 0) {
    autoTable(doc, {
      startY: y,
      body: briefingRows,
      theme: "plain", // No borders, relies on padding and background shades
      styles: {
        overflow: "linebreak",
      },
      margin: { left: 14, right: 14 },
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

        const formattedInstructions = ins.instruction
          ? ins.instruction
              .replace(/\s*(\d+\))/g, "\n$1")
              .replace(/(\d+\)[^\n]*)/g, "$1\n")
              .trim()
          : "—";

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
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
        valign: "top",
      },
      columnStyles: {
        0: { cellWidth: 35, fillColor: [250, 251, 252] },
        1: {
          cellWidth: "auto",
          cellPadding: { top: 5, right: 8, bottom: 5, left: 5 },
        },
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
        c.primaryDutyAction || "—",
      ]),
      theme: "grid",
      styles: { overflow: "linebreak", cellPadding: 4 },
      didParseCell: applyFontToCell,
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

      // Officer Header Block
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

          // ROW 1: Train Header
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

          // ROW 2: Transcript & Summary LABELS
          bodyRows.push([
            {
              content: "TRANSCRIPT",
              styles: {
                font: "helvetica",
                fontStyle: "bold",
                fontSize: 7.5,
                textColor: [100, 116, 139],
                halign: "left",
                valign: "middle",
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
                halign: "left",
                valign: "middle",
                cellPadding: { top: 4, bottom: 3, left: 14, right: 14 },
              },
            },
          ]);

          // ROW 3: Transcript & Summary DATA
          bodyRows.push([
            {
              content: r.transcript ? r.transcript.trim() : "—",
              styles: {
                font: detectFont(r.transcript),
                textColor: [30, 41, 59],
                fontSize: 9,
                halign: "left",
                valign: "middle",
                cellPadding: { top: 2, bottom: 5, left: 14, right: 14 },
              },
            },
            {
              content: finalSummary ? finalSummary.trim() : "—",
              styles: {
                font: "helvetica",
                textColor: [30, 41, 59],
                fontSize: 9,
                halign: "left",
                valign: "middle",
                cellPadding: { top: 2, bottom: 5, left: 14, right: 14 },
              },
            },
          ]);

          // ROW 4: Observations & Improvements LABELS
          bodyRows.push([
            {
              content: "OBSERVATIONS",
              styles: {
                font: "helvetica",
                fontStyle: "bold",
                fontSize: 7.5,
                textColor: [100, 116, 139],
                halign: "left",
                valign: "middle",
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
                halign: "left",
                valign: "middle",
                cellPadding: { top: 4, bottom: 3, left: 14, right: 14 },
              },
            },
          ]);

          // ROW 5: Observations & Improvements DATA
          bodyRows.push([
            {
              content: r.observations || "—",
              styles: {
                font: "helvetica",
                textColor: [30, 41, 59],
                fontSize: 9,
                halign: "left",
                valign: "middle",
                cellPadding: { top: 2, bottom: 5, left: 14, right: 14 },
              },
            },
            {
              content: r.improvements || "—",
              styles: {
                font: "helvetica",
                textColor: [30, 41, 59],
                fontSize: 9,
                halign: "left",
                valign: "middle",
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

  // Duty Officer
  doc.line(14, y, 70, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_800);
  doc.text("Duty Officer Signature", 14, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_600);
  doc.text("Name / Rank / Date", 14, y + 9);

  // Post In-charge
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

  // Save the document
  const safePost = (data.post || "UNKNOWN").replace(/\s+/g, "");
  const safeShift = (data.shiftName || "SHIFT").replace(/\s+/g, "");
  doc.save(`${data.shiftDate}_${safePost}_${safeShift}.pdf`);
};

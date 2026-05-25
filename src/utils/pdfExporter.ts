import { jsPDF } from "jspdf";
import { SprintPlan, RoadmapPhase } from "../types";

async function fetchFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font from ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function normalizePdfText(text: string) {
  const replacements: Record<string, string> = {
    "\u00a0": " ",
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u2013": "-",
    "\u2014": "-",
    "\u2026": "...",
    "\u2022": "*",
    "\u2190": "<-",
    "\u2192": "->",
    "\u2194": "<->",
    "\u2191": "^",
    "\u2193": "v",
    "\u2500": "-",
    "\u2501": "=",
    "\u2502": "|",
    "\u2503": "|",
    "\u250c": "+",
    "\u2510": "+",
    "\u2514": "+",
    "\u2518": "+",
    "\u251c": "+",
    "\u2524": "+",
    "\u252c": "+",
    "\u2534": "+",
    "\u253c": "+",
    "\u2550": "=",
    "\u2551": "|",
    "\u2554": "+",
    "\u2557": "+",
    "\u255a": "+",
    "\u255d": "+",
    "\u2560": "+",
    "\u2563": "+",
    "\u2566": "+",
    "\u2569": "+",
    "\u256c": "+",
  };

  return text
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(
      /[\u00a0\u2018\u2019\u201c\u201d\u2013\u2014\u2026\u2022\u2190\u2192\u2194\u2191\u2193\u2500\u2501\u2502\u2503\u250c\u2510\u2514\u2518\u251c\u2524\u252c\u2534\u253c\u2550\u2551\u2554\u2557\u255a\u255d\u2560\u2563\u2566\u2569\u256c]/g,
      (char) => replacements[char] ?? char,
    )
    .replace(/\r\n?/g, "\n");
}

function parseMarkdownTable(lines: string[]) {
  let headers: string[] = [];
  const rows: string[][] = [];
  let isFirst = true;

  lines.forEach((line) => {
    const trimmed = normalizePdfText(line).trim();
    if (!trimmed.startsWith("|")) return;

    // Split by | and map to trimmed strings
    const parts = trimmed.split("|").map((p) => p.trim());
    // Remove empty first and last elements since the line starts/ends with |
    if (parts[0] === "") parts.shift();
    if (parts[parts.length - 1] === "") parts.pop();

    if (parts.length === 0) return;

    // Detect separator lines like :--- | ---:
    const isSeparator = parts.every(
      (p) =>
        p.startsWith(":") ||
        p.startsWith("-") ||
        p.endsWith(":") ||
        p.replace(/[:-\s]/g, "") === "",
    );
    if (isSeparator) return;

    if (isFirst) {
      headers = parts;
      isFirst = false;
    } else {
      rows.push(parts);
    }
  });

  return { headers, rows };
}

export async function exportAllArtifactsAsPDF({
  projectName,
  elevatorPitch,
  idea,
  techKeywords,
  prdMarkdown,
  userStories,
  roadmap,
  projectId,
}: {
  projectName: string;
  elevatorPitch: string;
  idea: string;
  techKeywords: string;
  prdMarkdown?: string;
  userStories?: SprintPlan[];
  roadmap?: RoadmapPhase[];
  projectId?: string;
}) {
  // Load checked states from localStorage if projectId exists
  let checkedCriteria: Record<string, boolean> = {};
  let completedItems: Record<string, boolean> = {};

  if (projectId) {
    try {
      const criteriaStr = localStorage.getItem(
        `ai_pm_${projectId}_checked_criteria`,
      );
      if (criteriaStr) checkedCriteria = JSON.parse(criteriaStr);

      const roadmapStr = localStorage.getItem(
        `ai_pm_${projectId}_roadmap_completed_items`,
      );
      if (roadmapStr) completedItems = JSON.parse(roadmapStr);
    } catch (e) {
      console.warn(
        "Could not load checked states from localStorage inside PDF exporter:",
        e,
      );
    }
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let F_NAME = "Helvetica";

  // By default, avoid embedding external TTF fonts in the browser to prevent
  // jsPDF parsing/CORS issues. Use Helvetica unless a developer explicitly
  // enables font embedding by setting `window.__ENABLE_PDF_FONTS = true` in
  // the browser console during development.
  if (typeof window !== "undefined" && (window as any).__ENABLE_PDF_FONTS) {
    try {
      console.log("Fetching Roboto fonts for professional typography...");
      const [regularB64, boldB64, italicB64, boldItalicB64] = await Promise.all(
        [
          fetchFontAsBase64(`/api/font/roboto-regular`),
          fetchFontAsBase64(`/api/font/roboto-bold`),
          fetchFontAsBase64(`/api/font/roboto-italic`),
          fetchFontAsBase64(`/api/font/roboto-bolditalic`),
        ],
      );

      doc.addFileToVFS("Roboto-Regular.ttf", regularB64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

      doc.addFileToVFS("Roboto-Bold.ttf", boldB64);
      doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

      doc.addFileToVFS("Roboto-Italic.ttf", italicB64);
      doc.addFont("Roboto-Italic.ttf", "Roboto", "italic");

      doc.addFileToVFS("Roboto-BoldItalic.ttf", boldItalicB64);
      doc.addFont("Roboto-BoldItalic.ttf", "Roboto", "bolditalic");

      F_NAME = "Roboto";
      console.log("Roboto integrated successfully! Using Roboto for PDF.");
    } catch (err) {
      console.warn(
        "Could not load Roboto fonts, falling back to clean Helvetica:",
        err,
      );
      F_NAME = "Helvetica";
    }
  } else {
    F_NAME = "Helvetica";
  }

  const originalSetFont = doc.setFont;
  doc.setFont = function (fontName: string, ...args: any[]) {
    if (fontName === "Helvetica") {
      return originalSetFont.call(doc, F_NAME, ...args);
    }
    return originalSetFont.call(doc, fontName, ...args);
  };

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 20;
  const rightMargin = 20;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 170mm
  const topMargin = 25;
  const bottomMargin = 25;

  let y = topMargin;

  // Helper to verify bounds and trigger page breaks safely
  const checkPageBounds = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = topMargin;
    }
  };

  // ----------------- COVER SHEET (Page 1) -----------------
  // Elegant cover border/frame
  doc.setDrawColor(79, 70, 229); // indigo-600
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(0.4);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Top header logo decoration on cover
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text("S Y N T H E S I S  A I", leftMargin, 30);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("PRODUCT MASTER SPRINT BLUEPRINT", leftMargin, 35);

  // Measure title
  const fullTitle = projectName || "Core Blueprint Catalog";
  doc.setFont("Helvetica", "bold");

  // Choose font size for title adaptively. If title is long, make size smaller (e.g., 20 instead of 28)!
  let titleFontSize = 28;
  if (fullTitle.length > 120) {
    titleFontSize = 20;
  } else if (fullTitle.length > 60) {
    titleFontSize = 24;
  }
  doc.setFontSize(titleFontSize);

  const titleLines = doc.splitTextToSize(fullTitle, contentWidth);
  const titleH = titleLines.length * (titleFontSize * 0.3528 * 1.25);

  y = 52;
  doc.setTextColor(15, 23, 42);
  doc.text(titleLines, leftMargin, y);
  y += titleH + 5;

  // Separator bar
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1);
  doc.line(leftMargin, y, leftMargin + 40, y);
  y += 10;

  // Elevator Pitch block
  doc.setFont("Helvetica", "bolditalic");
  let pitchFontSize = 11;
  const pitchText = elevatorPitch
    ? `"${elevatorPitch}"`
    : '"Autonomous system generation roadmap containing PRD, sprints & milestones."';
  if (pitchText.length > 120) {
    pitchFontSize = 9.5;
  }
  doc.setFontSize(pitchFontSize);
  doc.setTextColor(79, 70, 229);
  const pitchLines = doc.splitTextToSize(pitchText, contentWidth - 10);
  const pitchH = pitchLines.length * (pitchFontSize * 0.3528 * 1.25);
  doc.text(pitchLines, leftMargin + 2, y);
  y += pitchH + 10;

  // Specifications list - truncate very long original prompts to avoid cover page text clipping
  const displayIdea =
    idea && idea.length > 165
      ? idea.substring(0, 162) + "..."
      : idea || "Custom Spec Idea";

  const specs = [
    { label: "Original Prompt:", value: displayIdea },
    {
      label: "Target Tech:",
      value: techKeywords || "React, TypeScript, Tailwind",
    },
    { label: "Engine Model:", value: "gemini-3.5-flash-guided" },
    { label: "Architect E-mail:", value: "chavatasiva@gmail.com" },
    {
      label: "Generated Date:",
      value: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  // Calculate specifications block height dynamically
  let calculatedSpecsHeight = 16;
  specs.forEach((spec) => {
    const cleanVal = doc.splitTextToSize(spec.value, contentWidth - 48);
    calculatedSpecsHeight += Math.max(1, cleanVal.length) * 4.2 + 2;
  });

  // Info card background block
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(
    leftMargin,
    y,
    contentWidth,
    calculatedSpecsHeight,
    4,
    4,
    "FD",
  );

  // Info details list
  let innerY = y + 8;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("BLUEPRINT SPECIFICATIONS", leftMargin + 8, innerY);
  innerY += 6;

  specs.forEach((spec) => {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(spec.label, leftMargin + 8, innerY);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(15, 23, 42); // slate-900

    const cleanVal = doc.splitTextToSize(spec.value, contentWidth - 48);
    cleanVal.forEach((line: string, lineIdx: number) => {
      doc.text(line, leftMargin + 42, innerY + lineIdx * 3.8);
    });

    innerY += Math.max(1, cleanVal.length) * 3.8 + 2;
  });

  y += calculatedSpecsHeight + 10;

  // Table of Contents Preview
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("DOCUMENT CONTENTS", leftMargin, y);
  y += 5;

  const tocItems = [
    {
      num: "01",
      title: "Product Requirements Document (PRD)",
      desc: "Core business constraints, scopes & features",
    },
    {
      num: "02",
      title: "Sprint Backlog & User Stories",
      desc: "User requirements and point estimates mapped over sprints",
    },
    {
      num: "03",
      title: "Development Milestone Roadmap",
      desc: "Sequence checklists, goals & readiness criteria",
    },
  ];

  tocItems.forEach((item) => {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(item.num, leftMargin, y);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(item.title, leftMargin + 10, y);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.desc, leftMargin + 10, y + 4);

    y += 9.5;
  });

  // ----------------- PAGE 2: PRD SECTION -----------------
  doc.addPage();
  y = topMargin;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(79, 70, 229);
  doc.text("01. PRODUCT REQUIREMENTS DOCUMENT (PRD)", leftMargin, y);
  y += 5;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.6);
  doc.line(leftMargin, y, leftMargin + 35, y);
  y += 11;

  interface MDBlock {
    type:
      | "heading"
      | "paragraph"
      | "bullet"
      | "code"
      | "table"
      | "hr"
      | "space";
    level?: number;
    text: string;
    lines: string[];
  }

  const parseMarkdownToBlocks = (markdown: string): MDBlock[] => {
    const rawLines = markdown.split("\n");
    const blocks: MDBlock[] = [];
    let inCodeBlock = false;
    let currentCodeLines: string[] = [];
    let inTable = false;
    let currentTableLines: string[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = normalizePdfText(rawLines[i]);
      const trimmed = rawLine.trim();

      // Handle Code Block Fences
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          blocks.push({
            type: "code",
            text: currentCodeLines.join("\n"),
            lines: [...currentCodeLines],
          });
          currentCodeLines = [];
          inCodeBlock = false;
        } else {
          if (inTable) {
            blocks.push({
              type: "table",
              text: currentTableLines.join("\n"),
              lines: [...currentTableLines],
            });
            currentTableLines = [];
            inTable = false;
          }
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        currentCodeLines.push(rawLine);
        continue;
      }

      // Handle Tables
      if (trimmed.startsWith("|")) {
        if (!inTable) {
          inTable = true;
        }
        currentTableLines.push(rawLine);
        continue;
      } else {
        if (inTable) {
          blocks.push({
            type: "table",
            text: currentTableLines.join("\n"),
            lines: [...currentTableLines],
          });
          currentTableLines = [];
          inTable = false;
        }
      }

      // Handle Horizontal Rule
      if (trimmed === "---") {
        blocks.push({ type: "hr", text: "---", lines: [] });
        continue;
      }

      // Handle Headings
      if (trimmed.startsWith("# ")) {
        blocks.push({
          type: "heading",
          level: 1,
          text: trimmed.substring(2).trim(),
          lines: [],
        });
        continue;
      }
      if (trimmed.startsWith("## ")) {
        blocks.push({
          type: "heading",
          level: 2,
          text: trimmed.substring(3).trim(),
          lines: [],
        });
        continue;
      }
      if (trimmed.startsWith("### ")) {
        blocks.push({
          type: "heading",
          level: 3,
          text: trimmed.substring(4).trim(),
          lines: [],
        });
        continue;
      }

      // Handle Bullets
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        blocks.push({
          type: "bullet",
          text: trimmed.substring(2).trim(),
          lines: [],
        });
        continue;
      }

      // Blank line
      if (trimmed === "") {
        blocks.push({ type: "space", text: "", lines: [] });
        continue;
      }

      // Regular paragraph
      blocks.push({ type: "paragraph", text: trimmed, lines: [] });
    }

    if (inCodeBlock && currentCodeLines.length > 0) {
      blocks.push({
        type: "code",
        text: currentCodeLines.join("\n"),
        lines: currentCodeLines,
      });
    }
    if (inTable && currentTableLines.length > 0) {
      blocks.push({
        type: "table",
        text: currentTableLines.join("\n"),
        lines: currentTableLines,
      });
    }

    return blocks;
  };

  const offScreenDoc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const originalOffscreenSetFont = offScreenDoc.setFont;
  offScreenDoc.setFont = function (fontName: string, ...args: any[]) {
    if (fontName === "Helvetica") {
      return originalOffscreenSetFont.call(offScreenDoc, F_NAME, ...args);
    }
    return originalOffscreenSetFont.call(offScreenDoc, fontName, ...args);
  };

  if (F_NAME === "Roboto") {
    try {
      offScreenDoc.addFileToVFS(
        "Roboto-Regular.ttf",
        doc.getFileFromVFS("Roboto-Regular.ttf"),
      );
      offScreenDoc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

      offScreenDoc.addFileToVFS(
        "Roboto-Bold.ttf",
        doc.getFileFromVFS("Roboto-Bold.ttf"),
      );
      offScreenDoc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

      offScreenDoc.addFileToVFS(
        "Roboto-Italic.ttf",
        doc.getFileFromVFS("Roboto-Italic.ttf"),
      );
      offScreenDoc.addFont("Roboto-Italic.ttf", "Roboto", "italic");

      offScreenDoc.addFileToVFS(
        "Roboto-BoldItalic.ttf",
        doc.getFileFromVFS("Roboto-BoldItalic.ttf"),
      );
      offScreenDoc.addFont("Roboto-BoldItalic.ttf", "Roboto", "bolditalic");
    } catch (e) {
      console.warn("Could not register fonts in offScreenDoc", e);
    }
  }

  const getBlockHeight = (block: MDBlock): number => {
    if (block.type === "space") {
      return 4;
    }
    if (block.type === "hr") {
      return 11;
    }
    if (block.type === "heading") {
      const text = block.text;
      let fontSize = 10;
      let spacingBefore = 2;
      let spacingAfter = 4;
      let extraHeight = 0;

      if (block.level === 1) {
        fontSize = 15;
        spacingAfter = 5;
        spacingBefore = 7;
        extraHeight = 2.2;
      } else if (block.level === 2) {
        fontSize = 12;
        spacingAfter = 4;
        spacingBefore = 5;
      } else if (block.level === 3) {
        fontSize = 10.5;
        spacingAfter = 3.5;
        spacingBefore = 4;
      }

      offScreenDoc.setFont(F_NAME, "bold");
      offScreenDoc.setFontSize(fontSize);
      const splitText = offScreenDoc.splitTextToSize(text, contentWidth);
      const textHeight = splitText.length * (fontSize * 0.3528 * 1.35);
      return spacingBefore + textHeight + spacingAfter + extraHeight;
    }

    if (block.type === "paragraph") {
      const text = block.text;
      const fontSize = 9.5;
      const spacingAfter = 4;
      const spacingBefore = 2;

      offScreenDoc.setFont(F_NAME, "normal");
      offScreenDoc.setFontSize(fontSize);
      const splitText = offScreenDoc.splitTextToSize(text, contentWidth);
      const textHeight = splitText.length * (fontSize * 0.3528 * 1.35);
      return spacingBefore + textHeight + spacingAfter;
    }

    if (block.type === "bullet") {
      const text = block.text;
      const fontSize = 9.2;
      const spacingAfter = 3;
      const spacingBefore = 0.5;

      offScreenDoc.setFont(F_NAME, "normal");
      offScreenDoc.setFontSize(fontSize);
      const activeWidth = contentWidth - 6;
      const splitText = offScreenDoc.splitTextToSize(text, activeWidth);
      const textHeight = splitText.length * (fontSize * 0.3528 * 1.35);
      return spacingBefore + textHeight + spacingAfter;
    }

    if (block.type === "code") {
      const codeLines = block.lines.map((line) => normalizePdfText(line));
      const baseFontSize = 7.5;
      const topPadding = 4;
      const bottomPadding = 4;
      const innerWidthPadding = 4;
      const maxCodeWidth = contentWidth - 2 * innerWidthPadding;

      offScreenDoc.setFont("Courier", "normal");
      offScreenDoc.setFontSize(baseFontSize);

      const longestLineWidth = codeLines.reduce((maxWidth, line) => {
        return Math.max(maxWidth, offScreenDoc.getTextWidth(line));
      }, 0);

      const fittedFontSize =
        longestLineWidth > 0
          ? Math.max(
              5.5,
              Math.min(
                baseFontSize,
                baseFontSize * (maxCodeWidth / longestLineWidth),
              ),
            )
          : baseFontSize;
      const lineSpacing = Math.max(2.8, fittedFontSize * 0.55);

      return codeLines.length * lineSpacing + topPadding + bottomPadding + 5;
    }

    if (block.type === "table") {
      // Return small lookahead height; row-by-row checkPageBounds inside draw loop handles pagination elegantly
      return 12;
    }

    return 0;
  };

  const calculateBlocksHeightRecursively = (blocksList: MDBlock[]): number => {
    if (blocksList.length === 0) return 0;
    const [first, ...rest] = blocksList;
    return getBlockHeight(first) + calculateBlocksHeightRecursively(rest);
  };

  if (prdMarkdown) {
    const blocks = parseMarkdownToBlocks(normalizePdfText(prdMarkdown));

    // Call recursive height calculator just for validation and structure
    const totalPrdHeight = calculateBlocksHeightRecursively(blocks);
    console.log(`Measured PRD total height recursively: ${totalPrdHeight}mm`);

    blocks.forEach((block) => {
      // Lookahead page-break detection for each markdown block elements
      const blockHeight = getBlockHeight(block);
      const printableHeight = pageHeight - topMargin - bottomMargin;

      if (y + blockHeight > pageHeight - bottomMargin) {
        if (blockHeight <= printableHeight || y > topMargin) {
          doc.addPage();
          y = topMargin;
        }
      }

      if (block.type === "space") {
        y += 4;
        return;
      }

      if (block.type === "hr") {
        y += 3;
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.line(leftMargin, y, pageWidth - rightMargin, y);
        y += 4;
        return;
      }

      if (block.type === "heading") {
        const text = block.text;
        let fontSize = 10;
        let colorRGB = [51, 65, 85];
        let spacingBefore = 2;
        let spacingAfter = 4;

        if (block.level === 1) {
          fontSize = 15;
          colorRGB = [15, 23, 42]; // slate-900
          spacingAfter = 5;
          spacingBefore = 7;
        } else if (block.level === 2) {
          fontSize = 12;
          colorRGB = [79, 70, 229]; // indigo-600
          spacingAfter = 4;
          spacingBefore = 5;
        } else if (block.level === 3) {
          fontSize = 10.5;
          colorRGB = [15, 23, 42];
          spacingAfter = 3.5;
          spacingBefore = 4;
        }

        if (y > topMargin && spacingBefore > 0) {
          y += spacingBefore;
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(fontSize);
        doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]);

        const splitText = doc.splitTextToSize(text, contentWidth);
        const textHeight = splitText.length * (fontSize * 0.3528 * 1.35);

        doc.text(splitText, leftMargin, y + fontSize * 0.3528 * 0.9);

        if (block.level === 1) {
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(0.5);
          doc.line(
            leftMargin,
            y + textHeight + 1.2,
            leftMargin + 25,
            y + textHeight + 1.2,
          );
          y += 2.2;
        }

        y += textHeight + spacingAfter;
        return;
      }

      if (block.type === "paragraph") {
        const text = block.text;
        const fontSize = 9.5;
        const colorRGB = [51, 65, 85]; // slate-700
        const spacingAfter = 4;
        const spacingBefore = 2;

        if (y > topMargin && spacingBefore > 0) {
          y += spacingBefore;
        }

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]);

        const splitText = doc.splitTextToSize(text, contentWidth);
        const textHeight = splitText.length * (fontSize * 0.3528 * 1.35);

        doc.text(splitText, leftMargin, y + fontSize * 0.3528 * 0.9);
        y += textHeight + spacingAfter;
        return;
      }

      if (block.type === "bullet") {
        const text = block.text;
        const fontSize = 9.2;
        const colorRGB = [51, 65, 85];
        const spacingAfter = 3;
        const spacingBefore = 0.5;

        if (y > topMargin && spacingBefore > 0) {
          y += spacingBefore;
        }

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]);

        const activeWidth = contentWidth - 6;
        const splitText = doc.splitTextToSize(text, activeWidth);
        const textHeight = splitText.length * (fontSize * 0.3528 * 1.35);

        doc.setFont("Helvetica", "bold");
        doc.text("•", leftMargin + 1, y + fontSize * 0.3528 * 0.9);
        doc.setFont("Helvetica", "normal");
        doc.text(splitText, leftMargin + 6, y + fontSize * 0.3528 * 0.9);

        y += textHeight + spacingAfter;
        return;
      }

      if (block.type === "code") {
        const codeLines = block.lines.map((line) => normalizePdfText(line));
        const baseFontSize = 7.5;
        const topPadding = 4;
        const bottomPadding = 4;
        const innerWidthPadding = 4;
        const maxCodeWidth = contentWidth - 2 * innerWidthPadding;

        doc.setFont("Courier", "normal");
        doc.setFontSize(baseFontSize);

        const longestLineWidth = codeLines.reduce((maxWidth, line) => {
          return Math.max(maxWidth, doc.getTextWidth(line));
        }, 0);

        const fittedFontSize =
          longestLineWidth > 0
            ? Math.max(
                5.5,
                Math.min(
                  baseFontSize,
                  baseFontSize * (maxCodeWidth / longestLineWidth),
                ),
              )
            : baseFontSize;
        const lineSpacing = Math.max(2.8, fittedFontSize * 0.55); // mm per line

        const blockHeight =
          codeLines.length * lineSpacing + topPadding + bottomPadding;

        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.35);
        doc.roundedRect(
          leftMargin,
          y,
          contentWidth,
          blockHeight,
          1.5,
          1.5,
          "FD",
        );

        doc.setTextColor(30, 41, 59); // slate-800

        doc.setFontSize(fittedFontSize);

        let lineY = y + topPadding + fittedFontSize * 0.3528 * 0.9;
        codeLines.forEach((line) => {
          doc.text(line, leftMargin + innerWidthPadding, lineY);
          lineY += lineSpacing;
        });

        y += blockHeight + 5;
        return;
      }

      if (block.type === "table") {
        const tableLines = block.lines;
        const { headers, rows } = parseMarkdownTable(tableLines);

        if (headers.length === 0) {
          // Fallback to original Courier monospace rendering with wrapping to prevent overflows
          const fontSize = 8;
          const lineSpacing = 3.8;
          const topPadding = 3;
          const bottomPadding = 3;
          const innerWidthPadding = 3;
          const tableWidth = contentWidth - 2 * innerWidthPadding;

          doc.setFont("Courier", "normal");
          doc.setFontSize(fontSize);

          const processedTableLines: string[] = [];
          tableLines.forEach((line) => {
            const split = doc.splitTextToSize(line, tableWidth);
            processedTableLines.push(...split);
          });

          const blockHeight =
            processedTableLines.length * lineSpacing +
            topPadding +
            bottomPadding;

          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.25);
          doc.roundedRect(leftMargin, y, contentWidth, blockHeight, 1, 1, "FD");

          doc.setTextColor(30, 41, 59);

          let lineY = y + topPadding + fontSize * 0.3528 * 0.9;
          processedTableLines.forEach((line) => {
            doc.text(line, leftMargin + innerWidthPadding, lineY);
            lineY += lineSpacing;
          });

          y += blockHeight + 5;
          return;
        }

        // We have headers and rows! Clean up cell markdown markers like **, *, etc.
        const cleanCellText = (txt: string) => {
          return txt.replace(/\*\*/g, "").replace(/\*/g, "").trim();
        };

        const numCols = headers.length;
        let colWidths: number[] = [];
        if (numCols === 2) {
          colWidths = [contentWidth * 0.3, contentWidth * 0.7];
        } else if (numCols === 7) {
          colWidths = [
            contentWidth * 0.12, // Req ID (e.g. F-101)
            contentWidth * 0.18, // Req Name
            contentWidth * 0.28, // Description (Needs more space)
            contentWidth * 0.1, // Priority
            contentWidth * 0.1, // Impact
            contentWidth * 0.1, // Complexity
            contentWidth * 0.12, // Technical Scope
          ];
        } else {
          const eqWidth = contentWidth / numCols;
          colWidths = Array(numCols).fill(eqWidth);
        }

        // Draw headers row
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42); // slate-900

        // Find header height
        let maxHeaderLines = 1;
        const splitHeaders = headers.map((h, colIdx) => {
          const colW = colWidths[colIdx] || contentWidth / numCols;
          const lines = doc.splitTextToSize(cleanCellText(h), colW - 3);
          if (lines.length > maxHeaderLines) maxHeaderLines = lines.length;
          return lines;
        });

        const headerHeight = maxHeaderLines * 4 + 4;
        checkPageBounds(headerHeight + 2);

        // Draw header background
        doc.setFillColor(241, 245, 249); // slate-100
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.25);
        doc.rect(leftMargin, y, contentWidth, headerHeight, "FD");

        // Write header text
        let colX = leftMargin;
        splitHeaders.forEach((lines, colIdx) => {
          const colW = colWidths[colIdx] || contentWidth / numCols;
          let cellY = y + 3;
          lines.forEach((line) => {
            doc.text(line, colX + 1.5, cellY + 8 * 0.3528 * 0.85);
            cellY += 3.8;
          });
          colX += colW;
        });

        // Add bottom separator under header
        doc.setDrawColor(148, 163, 184); // slate-400
        doc.setLineWidth(0.3);
        doc.line(
          leftMargin,
          y + headerHeight,
          leftMargin + contentWidth,
          y + headerHeight,
        );

        y += headerHeight;

        // Draw data rows
        rows.forEach((row, rowIdx) => {
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(7.5); // slightly smaller for extremely wide tables
          doc.setTextColor(51, 65, 85); // slate-700

          let maxCellLines = 1;
          const splitCells = row.map((cellTxt, colIdx) => {
            const colW = colWidths[colIdx] || contentWidth / numCols;
            const lines = doc.splitTextToSize(cleanCellText(cellTxt), colW - 3);
            if (lines.length > maxCellLines) maxCellLines = lines.length;
            return lines;
          });

          const rowHeight = maxCellLines * 3.8 + 4;
          checkPageBounds(rowHeight + 2);

          // Alternating row background
          if (rowIdx % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(leftMargin, y, contentWidth, rowHeight, "F");
          }

          // Write cell texts
          let cellColX = leftMargin;
          splitCells.forEach((lines, colIdx) => {
            const colW = colWidths[colIdx] || contentWidth / numCols;
            let cellY = y + 2.5;

            // Make first column bold (e.g. Req ID, Term, etc.)
            if (colIdx === 0) {
              doc.setFont("Helvetica", "bold");
              doc.setTextColor(15, 23, 42);
            } else {
              doc.setFont("Helvetica", "normal");
              doc.setTextColor(51, 65, 85);
            }

            lines.forEach((line) => {
              doc.text(line, cellColX + 1.5, cellY + 7.5 * 0.3528 * 0.85);
              cellY += 3.5;
            });
            cellColX += colW;
          });

          // Draw horizontal separate line under row
          doc.setDrawColor(226, 232, 240); // slate-200
          doc.setLineWidth(0.15);
          doc.line(
            leftMargin,
            y + rowHeight,
            leftMargin + contentWidth,
            y + rowHeight,
          );

          y += rowHeight;
        });

        y += 5; // spacing after table
        return;
      }
    });
  } else {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "No active Product Requirements Document available.",
      leftMargin,
      y,
    );
    y += 10;
  }

  // ----------------- USER STORIES SECTION -----------------
  doc.addPage();
  y = topMargin;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(79, 70, 229);
  doc.text("02. SPRINT BACKLOG & USER STORIES", leftMargin, y);
  y += 5;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.6);
  doc.line(leftMargin, y, leftMargin + 35, y);
  y += 11;
  if (userStories && userStories.length > 0) {
    userStories.forEach((sprint) => {
      // Sprint Header Box
      const wrappedFocus = doc.splitTextToSize(
        `Sprint Focus: ${sprint.focus}`,
        contentWidth - 30,
      );
      const headerBoxHeight = Math.max(15, 8 + wrappedFocus.length * 4);
      checkPageBounds(headerBoxHeight + 10);

      doc.setFillColor(243, 244, 246); // slate-100
      doc.setDrawColor(209, 213, 219); // slate-300
      doc.setLineWidth(0.3);
      doc.roundedRect(leftMargin, y, contentWidth, headerBoxHeight, 2, 2, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(sprint.sprintName.toUpperCase(), leftMargin + 4, y + 5.5);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      wrappedFocus.forEach((line: string, idx: number) => {
        doc.text(line, leftMargin + 4, y + 10.5 + idx * 4);
      });

      const totalSprintSP = sprint.stories.reduce(
        (sum, s) => sum + s.storyPoints,
        0,
      );
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `${totalSprintSP} SP Total`,
        pageWidth - rightMargin - 4,
        y + 6.5,
        { align: "right" },
      );

      y += headerBoxHeight + 6;

      sprint.stories.forEach((story) => {
        // Individual story block
        const descStr = `As a ${story.role}, I want to ${story.want}, so that ${story.benefit}.`;
        const wrapDesc = doc.splitTextToSize(descStr, contentWidth - 10);
        const descLineHeight = 3.8;
        const descHeight = wrapDesc.length * descLineHeight;

        // Dynamic Story Card Height with safe margins for ID, description, priority elements
        const storyCardHeight = 14 + descHeight + 5;
        checkPageBounds(storyCardHeight + 10);

        // Background box for user story card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.2);
        doc.roundedRect(
          leftMargin,
          y,
          contentWidth,
          storyCardHeight,
          1.5,
          1.5,
          "FD",
        );

        // ID tag badge
        doc.setFillColor(241, 245, 249); // slate-100
        doc.roundedRect(leftMargin + 3, y + 3, 16, 5, 1, 1, "F");

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(story.id, leftMargin + 11, y + 6.5, { align: "center" });

        // Title and Score info (Restricted width to prevent overlapping of long titles with story points)
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        const wrappedTitle = doc.splitTextToSize(
          story.title,
          contentWidth - 55,
        );
        doc.text(wrappedTitle[0], leftMargin + 22, y + 6.5);

        // Size & Priority Badge
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229);
        doc.text(
          `${story.storyPoints} Story Points`,
          pageWidth - rightMargin - 4,
          y + 6.5,
          { align: "right" },
        );

        // Core description As a / I want / So that description
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.2);
        doc.setTextColor(71, 85, 105); // slate-600

        wrapDesc.forEach((line: string, idx: number) => {
          doc.text(line, leftMargin + 5, y + 11.5 + idx * descLineHeight);
        });

        // Priority scale details
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        const prioColor =
          story.priority === "High"
            ? [225, 29, 72]
            : story.priority === "Medium"
              ? [217, 119, 6]
              : [71, 85, 105];
        doc.setTextColor(prioColor[0], prioColor[1], prioColor[2]);
        doc.text(
          `Priority: ${story.priority}`,
          leftMargin + 5,
          y + 11.5 + descHeight + 2,
        );

        y += storyCardHeight + 5;

        // Acceptance Criteria
        if (story.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
          checkPageBounds(15);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184); // slate-400
          doc.text("ACCEPTANCE CRITERIA", leftMargin + 5, y);
          y += 3.5;

          story.acceptanceCriteria.forEach((ac, acIdx) => {
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105); // slate-600

            const wrappedAc = doc.splitTextToSize(ac, contentWidth - 12);
            const acH = wrappedAc.length * 3.8;
            checkPageBounds(acH + 2);

            const isChecked = !!checkedCriteria[`${story.id}-${acIdx}`];

            // Draw beautiful vector checkbox square
            doc.saveGraphicsState();
            doc.setDrawColor(148, 163, 184); // slate-400
            doc.setLineWidth(0.2);
            if (isChecked) {
              doc.setFillColor(79, 70, 229); // indigo-600
              doc.roundedRect(
                leftMargin + 5,
                y + 0.3,
                2.8,
                2.8,
                0.5,
                0.5,
                "FD",
              );

              doc.setDrawColor(255, 255, 255);
              doc.setLineWidth(0.4);
              doc.line(leftMargin + 5.7, y + 1.7, leftMargin + 6.2, y + 2.2);
              doc.line(leftMargin + 6.2, y + 2.2, leftMargin + 7.2, y + 1.1);
            } else {
              doc.setFillColor(255, 255, 255);
              doc.roundedRect(
                leftMargin + 5,
                y + 0.3,
                2.8,
                2.8,
                0.5,
                0.5,
                "FD",
              );
            }
            doc.restoreGraphicsState();

            doc.text(wrappedAc[0], leftMargin + 9.5, y + 2.5);
            if (wrappedAc.length > 1) {
              for (let wrapIdx = 1; wrapIdx < wrappedAc.length; wrapIdx++) {
                doc.text(
                  wrappedAc[wrapIdx],
                  leftMargin + 9.5,
                  y + 2.5 + wrapIdx * 3.8,
                );
              }
            }
            y += acH + 1.5;
          });
          y += 2.5;
        }

        // Notes and Architect guidelines
        if (story.notes) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text("ARCHITECT GUIDANCE NOTES", leftMargin + 5, y);
          y += 3.5;

          doc.setFont("Helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);

          const wrappedNotes = doc.splitTextToSize(
            story.notes,
            contentWidth - 10,
          );
          const notesH = wrappedNotes.length * 3.5;
          checkPageBounds(notesH + 4);
          doc.text(wrappedNotes, leftMargin + 5, y + 2);
          y += notesH + 4;
        }

        y += 3;
      });

      y += 8;
    });
  } else {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("No user stories or sprint backlogs mapped.", leftMargin, y);
    y += 10;
  }

  // ----------------- ROADMAP SECTION -----------------
  doc.addPage();
  y = topMargin;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(79, 70, 229);
  doc.text("03. DEVELOPMENT ROADMAP & MILESTONES", leftMargin, y);
  y += 5;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.6);
  doc.line(leftMargin, y, leftMargin + 35, y);
  y += 11;

  if (roadmap && roadmap.length > 0) {
    roadmap.forEach((phase) => {
      // Phase Card Header - split left column (Title/Duration) and right column (Milestone info)
      const wrappedMilestone = doc.splitTextToSize(phase.milestone, 75);
      const wrappedTitle = doc.splitTextToSize(
        `PHASE ${phase.phaseNumber}: ${phase.phaseTitle.toUpperCase()}`,
        contentWidth - 85,
      );

      const leftColHeight = 10 + wrappedTitle.length * 4.5 + 5; // Title lines space + Duration space
      const rightColHeight = 6 + 4 + wrappedMilestone.length * 3.6;

      const headerBoxHeight = Math.max(leftColHeight, rightColHeight, 18);
      checkPageBounds(headerBoxHeight + 10);

      doc.setFillColor(249, 250, 251); // slate-50
      doc.setDrawColor(15, 23, 42); // slate-900 border accent
      doc.setLineWidth(0.4);
      doc.roundedRect(leftMargin, y, contentWidth, headerBoxHeight, 2, 2, "FD");

      // Draw Left Column - Title (Supports long phrases safely)
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      wrappedTitle.forEach((line: string, idx: number) => {
        doc.text(line, leftMargin + 4, y + 5.5 + idx * 4.2);
      });

      const durationY = y + 5.5 + wrappedTitle.length * 4.2 + 1;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text(
        `Timeline Duration: ${phase.durationWeeks}`,
        leftMargin + 4,
        durationY,
      );

      // Draw Right Column - Milestone status details and descriptions (Aligned right gracefully)
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text("MVP MILESTONE", pageWidth - rightMargin - 4, y + 5.5, {
        align: "right",
      });

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      wrappedMilestone.forEach((line: string, idx: number) => {
        doc.text(line, pageWidth - rightMargin - 4, y + 9.5 + idx * 3.6, {
          align: "right",
        });
      });

      y += headerBoxHeight + 6;

      // Calculate exact heights of dynamic elements before committing layout bounds
      let calculatedObjHeight = 5;
      const wrappedObjects = phase.coreObjectives.map((obj) => {
        const wrapped = doc.splitTextToSize(obj, contentWidth / 2 - 8);
        calculatedObjHeight += wrapped.length * 4 + 1.5;
        return wrapped;
      });

      let calculatedTaskHeight = 5;
      const wrappedTasksList = phase.detailedTasks.map((task) => {
        const wrapped = doc.splitTextToSize(task, contentWidth / 2 - 10);
        calculatedTaskHeight += wrapped.length * 3.6 + 1.5;
        return wrapped;
      });

      const sectionHeight = Math.max(calculatedObjHeight, calculatedTaskHeight);
      checkPageBounds(sectionHeight + 15);

      // Print Key Objectives Column
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("CORE STRATEGIC OBJECTIVES", leftMargin, y);

      let oY = y + 5;
      wrappedObjects.forEach((wrappedObj) => {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);

        // Print the primary line starting with bullet
        doc.text("• " + wrappedObj[0], leftMargin, oY);
        // Cleanly print any wrapped remaining lines with safe spacing
        for (let idx = 1; idx < wrappedObj.length; idx++) {
          doc.text(wrappedObj[idx], leftMargin + 3, oY + idx * 4);
        }
        oY += wrappedObj.length * 4 + 1.5;
      });

      // Print Checklists Column
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(
        "IMPLEMENTATION TASK CHECKLIST",
        leftMargin + contentWidth / 2 + 3,
        y,
      );

      let tY = y + 5;
      wrappedTasksList.forEach((wrappedTask, taskIdx) => {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);

        const checkKey = `${phase.phaseNumber}-task-${taskIdx}`;
        const isChecked = !!completedItems[checkKey];
        const cx = leftMargin + contentWidth / 2 + 3;
        const cy = tY - 2.1;

        // Draw beautiful vector checkbox square
        doc.saveGraphicsState();
        doc.setDrawColor(148, 163, 184); // slate-400
        doc.setLineWidth(0.2);
        if (isChecked) {
          doc.setFillColor(100, 116, 139); // slate-500
          doc.roundedRect(cx, cy, 2.5, 2.5, 0.5, 0.5, "FD");

          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.35);
          doc.line(cx + 0.6, cy + 1.2, cx + 1.1, cy + 1.7);
          doc.line(cx + 1.1, cy + 1.7, cx + 1.9, cy + 0.7);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(cx, cy, 2.5, 2.5, 0.5, 0.5, "FD");
        }
        doc.restoreGraphicsState();

        // Print task text offset to make room for checkbox
        doc.text(wrappedTask[0], leftMargin + contentWidth / 2 + 7, tY);
        // Indent consecutive lines
        for (let idx = 1; idx < wrappedTask.length; idx++) {
          doc.text(
            wrappedTask[idx],
            leftMargin + contentWidth / 2 + 7,
            tY + idx * 3.6,
          );
        }
        tY += wrappedTask.length * 3.6 + 1.5;
      });

      y += Math.max(oY - y, tY - y) + 6;

      // Readiness criteria
      if (phase.readinessCriteria && phase.readinessCriteria.length > 0) {
        let readinessHeight = 5;
        const wrappedCriteriaList = phase.readinessCriteria.map((crit) => {
          // split based on contentWidth - 6 to leave room for beauty checkbox
          const lines = doc.splitTextToSize(crit, contentWidth - 6);
          readinessHeight += lines.length * 4 + 1;
          return lines;
        });

        checkPageBounds(readinessHeight + 8);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("PHASE COMPLETION READINESS GATES", leftMargin, y);
        y += 4.5;

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(79, 70, 229); // indigo-600

        wrappedCriteriaList.forEach((wrappedCrit, critIdx) => {
          const critHeight = wrappedCrit.length * 4 + 1;
          checkPageBounds(critHeight + 2);

          const checkKey = `${phase.phaseNumber}-criteria-${critIdx}`;
          const isChecked = !!completedItems[checkKey];
          const cx = leftMargin;
          const cy = y + 0.4;

          // Draw beautiful vector checkbox square
          doc.saveGraphicsState();
          doc.setDrawColor(79, 70, 229); // indigo-600
          doc.setLineWidth(0.2);
          if (isChecked) {
            doc.setFillColor(79, 70, 229); // indigo-600
            doc.roundedRect(cx, cy, 2.5, 2.5, 0.5, 0.5, "FD");

            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.35);
            doc.line(cx + 0.6, cy + 1.2, cx + 1.1, cy + 1.7);
            doc.line(cx + 1.1, cy + 1.7, cx + 1.9, cy + 0.7);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(cx, cy, 2.5, 2.5, 0.5, 0.5, "FD");
          }
          doc.restoreGraphicsState();

          // Write text lines offset by 5mm
          doc.text(wrappedCrit[0], leftMargin + 5, y + 2.3);
          for (let idx = 1; idx < wrappedCrit.length; idx++) {
            doc.text(wrappedCrit[idx], leftMargin + 5, y + 2.3 + idx * 4);
          }
          y += critHeight;
        });
        y += 3;
      }

      y += 6;
    });
  } else {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("No strategic roadmaps formulated.", leftMargin, y);
    y += 10;
  }

  // ----------------- DECORATIVE GLOBAL PAGINATION STAMPER -----------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Skip stamping cover elements on Page 1
    if (i === 1) continue;

    doc.saveGraphicsState();

    // Header text
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      "SYNTHESIS AI • INTEGRATED SYSTEM BLUEPRINT CATALOG",
      leftMargin,
      15,
    );

    // Fine header division line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.25);
    doc.line(leftMargin, 17, pageWidth - rightMargin, 17);

    // Footer divider & info
    doc.line(
      leftMargin,
      pageHeight - 17,
      pageWidth - rightMargin,
      pageHeight - 17,
    );
    doc.setFont("Helvetica", "bold");

    const sheetText = `Sheet ${i} of ${totalPages}`;
    doc.text(sheetText, pageWidth - rightMargin, pageHeight - 12, {
      align: "right",
    });

    // Measure dynamic width to safely truncate the project name without any text overlap
    const sheetTextWidth = doc.getTextWidth(sheetText);
    const maxAvailableFooterWidth = contentWidth - sheetTextWidth - 10; // offset buffer
    const baseFooterText = "CONFIDENTIAL SPRINT DELIVERABLE MAPPED FOR: ";

    let currentProjectText = projectName.toUpperCase();
    while (
      doc.getTextWidth(baseFooterText + currentProjectText) >
        maxAvailableFooterWidth &&
      currentProjectText.length > 0
    ) {
      currentProjectText = currentProjectText.substring(
        0,
        currentProjectText.length - 1,
      );
    }

    const finalProjectText =
      currentProjectText.length < projectName.length
        ? currentProjectText
            .substring(0, Math.max(0, currentProjectText.length - 3))
            .trim() + "..."
        : currentProjectText;

    doc.text(baseFooterText + finalProjectText, leftMargin, pageHeight - 12);

    doc.restoreGraphicsState();
  }

  doc.save(
    `${projectName.toLowerCase().replace(/\s+/g, "_")}_sprint_blueprint.pdf`,
  );
  try {
    // Expose generated PDF base64 in dev for automated validation/debugging
    if (typeof window !== "undefined") {
      try {
        const ab = doc.output("arraybuffer") as any;
        const u8 = new Uint8Array(ab);
        let binary = "";
        for (let i = 0; i < u8.length; i++)
          binary += String.fromCharCode(u8[i]);
        (window as any).__LAST_PDF_BASE64 = btoa(binary);
        console.log("PDF_BASE64_READY");
        // In local dev, POST the base64 PDF to the server for debugging/QA
        try {
          const isLocal =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
          if (isLocal) {
            const filename = (projectName || "export") + ".pdf";
            fetch("/api/debug-pdf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                base64: (window as any).__LAST_PDF_BASE64,
                filename,
              }),
            }).catch((err) => {
              console.warn("Could not POST debug PDF:", err);
            });
          }
        } catch (err) {
          // ignore
        }
      } catch (e) {
        // best-effort; do not interrupt normal flow
      }
    }
  } catch (e) {
    // ignore
  }
}

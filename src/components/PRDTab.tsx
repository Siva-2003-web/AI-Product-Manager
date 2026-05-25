/* eslint-disable */
import React, { useState, useMemo, useEffect } from "react";
import {
  Copy,
  Check,
  FileText,
  Download,
  FileDown,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  BookOpen,
  Share2,
  Link,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "motion/react";
import { ProjectState } from "../types";
import CommentSection from "./CommentSection";

interface PRDTabProps {
  prdMarkdown: string | undefined;
  project?: ProjectState;
}

interface ParsedLine {
  id: string;
  type: "h1" | "h2" | "h3" | "paragraph" | "bullet" | "divider" | "space";
  text: string;
  height: number;
  spacingBefore: number;
  spacingAfter: number;
}

// Estimate how many lines a text splits into on a given line budget
const estimateLineCount = (text: string, charsPerLine: number) => {
  if (!text) return 1;
  const charsCount = text.length;
  const baseLines = Math.ceil(charsCount / charsPerLine);

  const words = text.split(" ");
  let currentLine = "";
  let spaceLinesCount = 0;
  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= charsPerLine) {
      if (currentLine) currentLine += " ";
      currentLine += word;
    } else {
      spaceLinesCount++;
      currentLine = word;
    }
  }
  if (currentLine) spaceLinesCount++;

  return Math.max(baseLines, spaceLinesCount, 1);
};

// Layout rendering engine mapping line types to physical millimeter heights
const getPaginatedDataByHeight = (
  markdown: string | undefined,
): ParsedLine[][] => {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const parsedLines: ParsedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    const id = `line-${i}-${rawLine.substring(0, 10)}`;

    if (!rawLine) {
      parsedLines.push({
        id,
        type: "space",
        text: "",
        height: 4,
        spacingBefore: 0,
        spacingAfter: 0,
      });
      continue;
    }

    let text = rawLine;
    let fontSize = 10;
    let spacingAfter = 4;
    let spacingBefore = 2;
    let height = 0;
    let type: ParsedLine["type"] = "paragraph";

    if (rawLine.startsWith("# ")) {
      text = rawLine.replace("# ", "").trim();
      fontSize = 18;
      spacingAfter = 6;
      spacingBefore = 8;
      type = "h1";

      const charsPerLine = 48;
      const linesCount = estimateLineCount(text, charsPerLine);
      const textHeight = linesCount * (fontSize * 0.3528 * 1.35);
      height = textHeight + 2.5; // modern bottom underline margin
    } else if (rawLine.startsWith("## ")) {
      text = rawLine.replace("## ", "").trim();
      fontSize = 13;
      spacingAfter = 5;
      spacingBefore = 6;
      type = "h2";

      const charsPerLine = 65;
      const linesCount = estimateLineCount(text, charsPerLine);
      height = linesCount * (fontSize * 0.3528 * 1.35);
    } else if (rawLine.startsWith("### ")) {
      text = rawLine.replace("### ", "").trim();
      fontSize = 11;
      spacingAfter = 4;
      spacingBefore = 5;
      type = "h3";

      const charsPerLine = 78;
      const linesCount = estimateLineCount(text, charsPerLine);
      height = linesCount * (fontSize * 0.3528 * 1.35);
    } else if (rawLine.startsWith("- ") || rawLine.startsWith("* ")) {
      text = rawLine.substring(2).trim();
      fontSize = 10;
      spacingAfter = 3;
      spacingBefore = 1;
      type = "bullet";

      const charsPerLine = 85;
      const linesCount = estimateLineCount(text, charsPerLine);
      height = linesCount * (fontSize * 0.3528 * 1.35);
    } else if (rawLine === "---") {
      type = "divider";
      text = "";
      height = 7;
      spacingBefore = 0;
      spacingAfter = 0;
    } else {
      fontSize = 10;
      spacingAfter = 4;
      spacingBefore = 2;
      type = "paragraph";

      const charsPerLine = 90;
      const linesCount = estimateLineCount(text, charsPerLine);
      height = linesCount * (fontSize * 0.3528 * 1.35);
    }

    parsedLines.push({
      id,
      type,
      text,
      height,
      spacingBefore,
      spacingAfter,
    });
  }

  // Segment items into physical A4 pages (available layout dimension: 297mm height, minus 50mm margins)
  const pages: ParsedLine[][] = [[]];
  let currentY = 25; // y coordinate starts at topMargin (25mm)

  parsedLines.forEach((item) => {
    let spacingBeforeAmt = 0;
    if (currentY > 25 && item.spacingBefore > 0) {
      spacingBeforeAmt = item.spacingBefore;
    }

    const neededHeight = item.height + item.spacingAfter + spacingBeforeAmt;

    if (currentY + neededHeight > 297 - 25) {
      // Allocate fresh drawing page frame
      currentY = 25;
      pages.push([]);
    }

    if (currentY > 25 && item.spacingBefore > 0) {
      currentY += item.spacingBefore;
    }
    pages[pages.length - 1].push(item);
    currentY += item.height + item.spacingAfter;
  });

  return pages;
};

export default function PRDTab({ prdMarkdown, project }: PRDTabProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [prdCopied, setPrdCopied] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [previewMode, setPreviewMode] = useState<"stacked" | "single">(
    "stacked",
  );
  const [currentPage, setCurrentPage] = useState(1);

  const pages = useMemo(() => {
    return getPaginatedDataByHeight(prdMarkdown);
  }, [prdMarkdown]);

  const shareableUrl = useMemo(() => {
    if (!project) return "";
    try {
      const jsonStr = JSON.stringify(project);
      const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      return `${window.location.origin}${window.location.pathname}#shared=${encoded}`;
    } catch (e) {
      console.error("Error generating shareable URL:", e);
      return "";
    }
  }, [project]);

  if (!prdMarkdown) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prdMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prdMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PRODUCT_REQUIREMENTS_DOCUMENT.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const leftMargin = 20;
    const rightMargin = 20;
    const contentWidth = pageWidth - leftMargin - rightMargin; // 170mm
    const topMargin = 25;
    const bottomMargin = 25;

    let y = topMargin;
    let pageCount = 1;

    // Add decorative top header & bottom footer
    const drawPageDecorations = (pageNum: number) => {
      doc.saveGraphicsState();

      // Header text
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("SYNTHESIS AI • PRODUCT REQUIREMENTS BLUEPRINT", leftMargin, 15);

      // Fine header division line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.2);
      doc.line(leftMargin, 17, pageWidth - rightMargin, 17);

      // Footer divider & info
      doc.line(
        leftMargin,
        pageHeight - 17,
        pageWidth - rightMargin,
        pageHeight - 17,
      );
      doc.text(`Page ${pageNum}`, pageWidth - rightMargin, pageHeight - 12, {
        align: "right",
      });
      doc.text(
        "CONFIDENTIAL | AUTOMATICALLY ARCHITECTED SPRINT DOCUMENT",
        leftMargin,
        pageHeight - 12,
      );

      doc.restoreGraphicsState();
    };

    // Draw initial decorations on first page
    drawPageDecorations(1);

    const checkPageBounds = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - bottomMargin) {
        doc.addPage();
        pageCount++;
        y = topMargin;
        drawPageDecorations(pageCount);
      }
    };

    const lines = prdMarkdown.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i].trim();
      if (!rawLine) {
        // Subtle paragraph spacing
        checkPageBounds(4);
        y += 4;
        continue;
      }

      let text = rawLine;
      let fontSize = 10;
      let isBold = false;
      let colorRGB = [51, 65, 85]; // slate-700
      let spacingAfter = 4;
      let spacingBefore = 2;
      let isHeading = false;
      let isBullet = false;

      if (rawLine.startsWith("# ")) {
        text = rawLine.replace("# ", "").trim();
        fontSize = 18;
        isBold = true;
        colorRGB = [15, 23, 42]; // slate-900
        spacingAfter = 6;
        spacingBefore = 8;
        isHeading = true;
      } else if (rawLine.startsWith("## ")) {
        text = rawLine.replace("## ", "").trim();
        fontSize = 13;
        isBold = true;
        colorRGB = [79, 70, 229]; // indigo-600
        spacingAfter = 5;
        spacingBefore = 6;
        isHeading = true;
      } else if (rawLine.startsWith("### ")) {
        text = rawLine.replace("### ", "").trim();
        fontSize = 11;
        isBold = true;
        colorRGB = [15, 23, 42]; // slate-900
        spacingAfter = 4;
        spacingBefore = 5;
        isHeading = true;
      } else if (rawLine.startsWith("- ") || rawLine.startsWith("* ")) {
        text = rawLine.substring(2).trim();
        fontSize = 10;
        isBold = false;
        colorRGB = [51, 65, 85]; // slate-700
        spacingAfter = 3;
        spacingBefore = 1;
        isBullet = true;
      } else if (rawLine === "---") {
        checkPageBounds(8);
        y += 3;
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.line(leftMargin, y, pageWidth - rightMargin, y);
        y += 4;
        continue;
      }

      // Add spacing before
      if (y > topMargin && spacingBefore > 0) {
        y += spacingBefore;
      }

      doc.setFont("Helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]);

      const activeWidth = isBullet ? contentWidth - 6 : contentWidth;
      const splitText = doc.splitTextToSize(text, activeWidth);
      const textHeight = splitText.length * (fontSize * 0.3528 * 1.35);

      checkPageBounds(textHeight + spacingAfter);

      if (isBullet) {
        // Draw real circular indicator
        doc.setFont("Helvetica", "bold");
        doc.text("•", leftMargin + 1, y + fontSize * 0.3528 * 0.9);
        doc.setFont("Helvetica", "normal");

        // Output text next to it
        doc.text(splitText, leftMargin + 6, y + fontSize * 0.3528 * 0.9);
      } else {
        doc.text(splitText, leftMargin, y + fontSize * 0.3528 * 0.9);
      }

      // For Header 1, draw a modern bottom underline limit bar
      if (isHeading && fontSize === 18) {
        doc.setDrawColor(79, 70, 229); // indigo-600
        doc.setLineWidth(0.6);
        doc.line(
          leftMargin,
          y + textHeight + 1.5,
          leftMargin + 35,
          y + textHeight + 1.5,
        );
        y += 2.5;
      }

      y += textHeight + spacingAfter;
    }

    doc.save("PRODUCT_REQUIREMENTS_DOCUMENT.pdf");
  };

  const MockPage: React.FC<{
    pageData: ParsedLine[];
    pageIdx: number;
    zoom: number;
  }> = ({ pageData, pageIdx, zoom }) => {
    const baseWidth = 660;
    const baseHeight = 933; // Precise 1 : 1.414 aspect ratio matching A4
    const scale = (baseWidth * zoom) / 210; // Exact pixel scale mapping

    // Build CSS rules dynamically to avoid inline style props in JSX
    const rules: string[] = [];
    const pageSelector = `#virtual-page-${pageIdx}`;

    rules.push(`${pageSelector} { width: ${baseWidth * zoom}px; height: ${baseHeight * zoom}px; padding-left: ${(20 / 210) * 100}%; padding-right: ${(20 / 210) * 100}%; padding-top: ${(25 / 297) * 100}%; padding-bottom: ${(25 / 297) * 100}%; font-family: Arial, sans-serif; }
`);

    rules.push(`${pageSelector} .page-header { top: ${(15 / 297) * 100}%; padding-left: ${(20 / 210) * 100}%; padding-right: ${(20 / 210) * 100}%; padding-bottom: ${(2 / 297) * 100}%; }
`);
    rules.push(`${pageSelector} .page-header .header-text, ${pageSelector} .page-footer .footer-text { font-size: ${8 * 0.3528 * scale}px; }
`);
    rules.push(`${pageSelector} .page-footer { bottom: ${(17 / 297) * 100}%; padding-left: ${(20 / 210) * 100}%; padding-right: ${(20 / 210) * 100}%; padding-top: ${(3 / 297) * 100}%; }
`);

    pageData.forEach((item) => {
      const size =
        item.type === "h1"
          ? 18
          : item.type === "h2"
            ? 13
            : item.type === "h3"
              ? 11
              : 10;
      if (item.type === "space") {
        rules.push(`${pageSelector} .space-${item.id} { height: ${4 * scale}px; }
`);
      } else if (item.type === "divider") {
        rules.push(`${pageSelector} .divider-${item.id} { margin-top: ${3 * scale}px; margin-bottom: ${4 * scale}px; }
`);
      } else if (item.type === "h1") {
        rules.push(`${pageSelector} .item-${item.id} { margin-top: ${item.spacingBefore * scale}px; margin-bottom: ${item.spacingAfter * scale}px; font-size: ${size * 0.3528 * scale}px; line-height: 1.35; }
`);
        rules.push(`${pageSelector} .item-${item.id} .underline { height: ${0.6 * scale}px; width: ${35 * scale}px; margin-top: ${1.5 * scale}px; }
`);
      } else {
        rules.push(`${pageSelector} .item-${item.id} { margin-top: ${item.spacingBefore * scale}px; margin-bottom: ${item.spacingAfter * scale}px; font-size: ${size * 0.3528 * scale}px; line-height: 1.35; }
`);
      }
    });

    const css = rules.join("\n");

    return (
      <div
        id={`virtual-page-${pageIdx}`}
        className="bg-white border border-slate-300 shadow-[0_20px_40px_rgba(0,0,0,0.45)] relative overflow-hidden transition-all duration-200 text-slate-800 font-sans flex flex-col justify-start select-text"
      >
        <style>{css}</style>

        {/* Absolute Page Header Marker */}
        <div className="absolute left-0 right-0 border-b border-slate-200 page-header">
          <div className="flex justify-between items-center text-slate-400 font-bold tracking-wide header-text">
            <span>SYNTHESIS AI • PRODUCT REQUIREMENTS BLUEPRINT</span>
          </div>
        </div>

        {/* Absolute Page Footer Marker */}
        <div className="absolute left-0 right-0 border-t border-slate-200 page-footer">
          <div className="flex justify-between items-center text-slate-400 font-bold footer-text">
            <span>
              CONFIDENTIAL | AUTOMATICALLY ARCHITECTED SPRINT DOCUMENT
            </span>
            <span>Page {pageIdx + 1}</span>
          </div>
        </div>

        {/* Dynamic proportional layout contents */}
        <div className="w-full h-full flex flex-col relative">
          {pageData.map((item) => {
            if (item.type === "space") {
              return <div key={item.id} className={`space-${item.id}`} />;
            }

            if (item.type === "divider") {
              return (
                <div
                  key={item.id}
                  className={`w-full border-t border-slate-200 divider-${item.id}`}
                />
              );
            }

            if (item.type === "h1") {
              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col item-${item.id}`}
                >
                  <span className="font-bold text-slate-900">{item.text}</span>
                  <div className="bg-indigo-600 rounded-sm underline" />
                </div>
              );
            }

            if (item.type === "h2") {
              return (
                <div key={item.id} className={`pt-2 item-${item.id}`}>
                  <span className="text-lg font-bold text-slate-900">
                    {item.text}
                  </span>
                </div>
              );
            }

            // default paragraph
            return (
              <div key={item.id} className={`item-${item.id}`}>
                <span className="text-sm leading-relaxed text-slate-700">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handlePageNext = () => {
    if (currentPage < pages.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePagePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div id="prd-tab" className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-md font-bold text-slate-900 font-sans">
            Product Requirements Document (PRD)
          </h2>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-indigo-600 border border-indigo-700 rounded-lg hover:bg-indigo-705 hover:shadow-sm transition-all font-semibold cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-semibold cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Markdown</span>
          </button>

          {/* Virtual PDF Preview Trigger */}
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors font-semibold cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-500 animate-[pulse_2.5s_infinite]" />
            <span>Preview PDF Layout</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100/70 transition-colors font-semibold cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs max-h-160 overflow-y-auto custom-scrollbar font-sans text-sm text-slate-700 leading-relaxed space-y-6">
        {/* Render markdown style headings & details cleanly and programmatically */}
        <div className="prose max-w-none text-slate-800 space-y-4 wrap-break-word">
          {prdMarkdown.split("\n").map((line, index) => {
            if (line.startsWith("# ")) {
              return (
                <h1
                  key={index}
                  className="text-2xl font-extrabold text-slate-900 border-b border-slate-100 pb-2 pt-6 first:pt-0"
                >
                  {line.replace("# ", "")}
                </h1>
              );
            } else if (line.startsWith("## ")) {
              return (
                <h2
                  key={index}
                  className="text-xl font-bold text-slate-900 pt-5 pb-1"
                >
                  {line.replace("## ", "")}
                </h2>
              );
            } else if (line.startsWith("### ")) {
              return (
                <h3
                  key={index}
                  className="text-md font-bold text-slate-900 pt-4"
                >
                  {line.replace("### ", "")}
                </h3>
              );
            } else if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <ul
                  key={index}
                  className="ml-4 list-disc pl-1 list-inside marker:text-indigo-500"
                >
                  <li>{line.substring(2)}</li>
                </ul>
              );
            } else if (line.trim() === "---") {
              return (
                <hr key={index} className="border-t border-slate-100 my-6" />
              );
            } else if (line.trim()) {
              return (
                <p
                  key={index}
                  className="leading-relaxed text-slate-600 font-sans"
                >
                  {line}
                </p>
              );
            }
            return <div key={index} className="h-2" />;
          })}
        </div>
      </div>

      {/* PRD Artifact Comment Section Feedback Thread */}
      <CommentSection projectId={project?.id || "demo-proj"} scope="prd" />

      {/* High-fidelity PDF Virtual Layout Proofing Workspace */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-slate-100">
            {/* Professional Acrobat/Drafting Style Header Toolbar */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-400/20 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    PDF Print Proof Workspace
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold font-mono tracking-wider">
                    A4 FORMAT • VERIFY WRAPPING & SPACING BEFORE GENERATION
                  </p>
                </div>
              </div>

              {/* View Control Panel */}
              <div className="flex items-center md:gap-4 gap-2">
                {/* Mode Selector */}
                <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 shrink-0">
                  <button
                    onClick={() => setPreviewMode("stacked")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      previewMode === "stacked"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Stacked Sheets</span>
                  </button>
                  <button
                    onClick={() => {
                      setPreviewMode("single");
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      previewMode === "single"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Single Page</span>
                  </button>
                </div>

                {/* Vertical paging controllers when in single page mode */}
                {previewMode === "single" && (
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                    <button
                      onClick={handlePagePrev}
                      disabled={currentPage <= 1}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono w-14 text-center select-none text-slate-300">
                      {currentPage} / {pages.length}
                    </span>
                    <button
                      onClick={handlePageNext}
                      disabled={currentPage >= pages.length}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Robust Zoom panel */}
                <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 shrink-0">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
                    disabled={zoom <= 0.4}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 transition-colors cursor-pointer"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono w-12 text-center text-slate-300 select-none">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
                    disabled={zoom >= 2.0}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 transition-colors cursor-pointer"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <div className="hidden md:block w-px h-6 bg-slate-800" />

                {/* Trigger Physical PDF Generator */}
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-indigo-600 border border-indigo-500 rounded-lg text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/15 transition-all font-bold cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF Receipt</span>
                </button>

                {/* Dismiss View Panel */}
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Workspace"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Canvas Area with high precision Blueprint Draft Layout background */}
            <div className="flex-1 overflow-auto p-12 flex items-start justify-center custom-scrollbar select-none bg-slate-950 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] bg-size-[20px_20px] shadow-inner relative">
              {pages.length === 0 ? (
                <div className="text-slate-400 text-xs font-mono">
                  No parsed blueprint records available.
                </div>
              ) : previewMode === "stacked" ? (
                <div className="flex flex-col gap-12 pb-16">
                  {pages.map((page, idx) => (
                    <div
                      key={idx}
                      className="relative flex flex-col items-center"
                    >
                      <div className="mb-2 text-[10px] text-slate-500 font-mono self-start tracking-wider">
                        SHEET {idx + 1} OF {pages.length} • PROPORTIONAL
                        RENDERING (A4)
                      </div>
                      <MockPage pageData={page} pageIdx={idx} zoom={zoom} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative flex flex-col items-center">
                  <div className="mb-2 text-[10px] text-slate-500 font-mono self-start tracking-wider">
                    CURRENT SHEET {currentPage} OF {pages.length} • PROPORTIONAL
                    RENDERING (A4)
                  </div>
                  <MockPage
                    pageData={pages[currentPage - 1]}
                    pageIdx={currentPage - 1}
                    zoom={zoom}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Blueprint / PRD Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border-2 border-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl relative text-slate-900 font-sans"
            >
              {/* Close pin */}
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-3.5 mb-5 select-none">
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    Share PRD &amp; Blueprint
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Generate a shareable loading URL or copy raw content
                    snapshot to clipboard
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Mode 1: URL Shareable load URL */}
                {shareableUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                      GENERATE LINK SHARE (RECONSTRUCT COMPLETE BLUEPRINT)
                    </span>
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono select-all truncate text-slate-600 leading-none flex items-center">
                        {shareableUrl}
                      </div>
                      <button
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(shareableUrl);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          } catch (err) {
                            console.error("Link copy failed:", err);
                          }
                        }}
                        className="px-3.5 py-2 text-xs bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 min-w-31.25 justify-center"
                      >
                        {linkCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Link Copied</span>
                          </>
                        ) : (
                          <>
                            <Link className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      This link encapsulates the full dashboard snapshot. Direct
                      loading re-creates the exact same specs securely in the
                      browser tab.
                    </p>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-slate-100 my-1" />

                {/* Mode 2: Copy raw PRD text content */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    COPY SNAPSHOT SPECIFICATIONS (MARKDOWN TEXT)
                  </span>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-100/70 border border-slate-200/60 rounded-xl p-3 text-xs italic text-slate-500 max-h-25 overflow-y-auto custom-scrollbar leading-relaxed">
                      {prdMarkdown
                        ? prdMarkdown.substring(0, 180) + "..."
                        : "PRD payload is empty."}
                    </div>
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(prdMarkdown || "");
                          setPrdCopied(true);
                          setTimeout(() => setPrdCopied(false), 2000);
                        } catch (err) {
                          console.error("Text copy failed:", err);
                        }
                      }}
                      className="px-3.5 py-2 text-xs bg-white text-slate-700 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5 min-w-31.25 justify-center self-start"
                    >
                      {prdCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">PRD Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy PRD txt</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Copy the raw markdown string to easily paste inside your
                    internal JIRA tickets, Slack, or corporate documentation.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

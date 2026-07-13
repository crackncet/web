"use client";

import React, { useEffect, useState, useMemo } from "react";

// ─── Math Block Type ──────────────────────────────────────────────────────────

interface MathBlock {
  token: string;
  raw: string;
  display: boolean;
}

// ─── Token Extraction Helpers ────────────────────────────────────────────────

function extractMath(text: string): { processed: string; blocks: MathBlock[] } {
  const blocks: MathBlock[] = [];
  let index = 0;
  let processed = text;

  // 1. Double dollars: $$ ... $$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, p1) => {
    const token = `%%MATHDISPLAY${index++}%%`;
    blocks.push({ token, raw: p1, display: true });
    return token;
  });

  // 2. Escaped bracket block math: \[ ... \]
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, p1) => {
    const token = `%%MATHDISPLAY${index++}%%`;
    blocks.push({ token, raw: p1, display: true });
    return token;
  });

  // 3. Environment blocks: \begin{env} ... \end{env}
  const envs = ["equation", "align", "gather", "CD", "matrix", "pmatrix", "bmatrix", "array"];
  for (const env of envs) {
    const regex = new RegExp(`\\\\begin\\{${env}\\}([\\s\\S]*?)\\\\end\\{${env}\\}`, "g");
    processed = processed.replace(regex, (match) => {
      const token = `%%MATHDISPLAY${index++}%%`;
      blocks.push({ token, raw: match, display: true });
      return token;
    });
  }

  // 4. Escaped parentheses inline math: \( ... \)
  processed = processed.replace(/\\\\\(([\s\S]*?)\\\\\)/g, (_, p1) => {
    const token = `%%MATHINLINE${index++}%%`;
    blocks.push({ token, raw: p1, display: false });
    return token;
  });

  // 5. Single dollars: $ ... $ (avoiding double dollars or empty contents)
  processed = processed.replace(/\$([^$\n]+?)\$/g, (_, p1) => {
    const token = `%%MATHINLINE${index++}%%`;
    blocks.push({ token, raw: p1, display: false });
    return token;
  });

  return { processed, blocks };
}

// ─── Inline Formatting ────────────────────────────────────────────────────────

function parseInlineElements(text: string): string {
  let html = text;

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>');

  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-muted-foreground">$1</del>');

  // Subscript / Superscript formatting (e.g. H~2~O, x^2^)
  html = html.replace(/~([^~]+?)~/g, '<sub class="text-[0.75em] vertical-align-sub font-semibold">$1</sub>');
  html = html.replace(/\^([^^]+?)\^/g, '<sup class="text-[0.75em] vertical-align-super font-semibold">$1</sup>');

  // HTML Subscript / Superscript tag support
  html = html.replace(/<sub>([\s\S]*?)<\/sub>/gi, '<sub class="text-[0.75em] vertical-align-sub font-semibold">$1</sub>');
  html = html.replace(/<sup>([\s\S]*?)<\/sup>/gi, '<sup class="text-[0.75em] vertical-align-super font-semibold">$1</sup>');

  return html;
}

// ─── Table Builder ────────────────────────────────────────────────────────────

function renderTableHTML(headers: string[], rows: string[][]): string {
  let html = '<div class="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"><table class="w-full text-left border-collapse text-xs">';
  if (headers.length > 0) {
    html += '<thead class="bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-350 font-bold border-b border-slate-200 dark:border-slate-800">';
    html += '<tr>';
    headers.forEach((h) => {
      html += `<th class="px-4 py-2.5 font-bold">${h}</th>`;
    });
    html += '</tr></thead>';
  }
  html += '<tbody class="divide-y divide-slate-150 dark:divide-slate-850 text-slate-650 dark:text-slate-350 bg-white dark:bg-slate-900/40">';
  rows.forEach((row) => {
    html += '<tr class="hover:bg-slate-55/40 dark:hover:bg-slate-800/10 transition-colors">';
    row.forEach((cell) => {
      html += `<td class="px-4 py-2">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

// ─── Markdown Blocks Parser ───────────────────────────────────────────────────

function parseMarkdown(mdText: string): string {
  // Extract block SVGs so they are not parsed/escaped
  const svgs: string[] = [];
  let tempText = mdText;
  tempText = tempText.replace(/<svg[\s\S]*?<\/svg>/gi, (match) => {
    const token = `%%SVGBLOCK${svgs.length}%%`;
    svgs.push(match);
    return token;
  });

  const lines = tempText.split("\n");
  const output: string[] = [];

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  let inList = false;
  let listType: "ul" | "ol" | null = null;

  const flushTable = () => {
    if (inTable) {
      output.push(renderTableHTML(tableHeaders, tableRows));
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }
  };

  const flushList = () => {
    if (inList) {
      if (listType === "ul") {
        output.push("</ul>");
      } else if (listType === "ol") {
        output.push("</ol>");
      }
      inList = false;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Detect table row
    const isTableRow = trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 1;
    if (isTableRow) {
      flushList();
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isSeparator = cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));

      if (isSeparator) {
        inTable = true;
        continue;
      }

      if (inTable) {
        tableRows.push(cells.map(parseInlineElements));
      } else {
        const nextLine = lines[i + 1]?.trim() || "";
        const nextCells = nextLine
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const nextIsSeparator = nextCells.length > 0 && nextCells.every((c) => /^:?-+:?$/.test(c));

        if (nextIsSeparator) {
          tableHeaders = cells.map(parseInlineElements);
        } else {
          output.push(parseInlineElements(trimmed) + "<br/>");
        }
      }
      continue;
    } else {
      flushTable();
    }

    // 2. Detect Lists
    const ulMatch = rawLine.match(/^(\s*)[-*+]\s+(.*)$/);
    const olMatch = rawLine.match(/^(\s*)\d+\.\s+(.*)$/);

    if (ulMatch) {
      if (!inList || listType !== "ul") {
        flushList();
        output.push('<ul class="list-disc pl-5 my-2 space-y-1 text-slate-700 dark:text-slate-300">');
        inList = true;
        listType = "ul";
      }

      let itemContent = ulMatch[2];
      let isTask = false;
      let taskChecked = false;

      if (itemContent.startsWith("[ ] ")) {
        isTask = true;
        taskChecked = false;
        itemContent = itemContent.slice(4);
      } else if (itemContent.startsWith("[x] ") || itemContent.startsWith("[X] ")) {
        isTask = true;
        taskChecked = true;
        itemContent = itemContent.slice(4);
      }

      if (isTask) {
        const checkboxHtml = taskChecked
          ? '<input type="checkbox" checked disabled class="mr-2 h-3.5 w-3.5 accent-primary rounded-sm pointer-events-none" />'
          : '<input type="checkbox" disabled class="mr-2 h-3.5 w-3.5 rounded-sm pointer-events-none" />';
        output.push(`<li class="list-none -ml-5 flex items-center">${checkboxHtml}${parseInlineElements(itemContent)}</li>`);
      } else {
        const hasEmoji = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(itemContent.trim());
        if (hasEmoji) {
          output.push(`<li class="list-none -ml-5 flex items-start gap-1.5">${parseInlineElements(itemContent)}</li>`);
        } else {
          output.push(`<li>${parseInlineElements(itemContent)}</li>`);
        }
      }
      continue;
    } else if (olMatch) {
      if (!inList || listType !== "ol") {
        flushList();
        output.push('<ol class="list-decimal pl-5 my-2 space-y-1 text-slate-700 dark:text-slate-300">');
        inList = true;
        listType = "ol";
      }
      output.push(`<li>${parseInlineElements(olMatch[2])}</li>`);
      continue;
    } else {
      flushList();
    }

    // 3. Detect Headers
    if (trimmed.startsWith("### ")) {
      output.push(`<h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">${parseInlineElements(trimmed.slice(4))}</h4>`);
      continue;
    } else if (trimmed.startsWith("## ")) {
      output.push(`<h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-5 mb-2.5">${parseInlineElements(trimmed.slice(3))}</h3>`);
      continue;
    } else if (trimmed.startsWith("# ")) {
      output.push(`<h2 class="text-base font-bold text-slate-855 dark:text-slate-100 mt-6 mb-3">${parseInlineElements(trimmed.slice(2))}</h2>`);
      continue;
    }

    // 4. Empty Lines
    if (trimmed === "") {
      output.push('<div class="h-2"></div>');
      continue;
    }

    // 5. Regular text lines
    output.push(parseInlineElements(rawLine) + "<br/>");
  }

  flushTable();
  flushList();

  let html = output.join("\n");

  // Restore SVGs
  for (let idx = 0; idx < svgs.length; idx++) {
    html = html.replace(`%%SVGBLOCK${idx}%%`, svgs[idx]);
  }

  return html;
}

// ─── Math Renderer (KaTeX) ────────────────────────────────────────────────────

function renderMathTokens(html: string, blocks: MathBlock[]): string {
  let output = html;
  const katex = typeof window !== "undefined" ? (window as any).katex : null;

  blocks.forEach((block) => {
    let rendered = block.raw;
    if (katex) {
      try {
        rendered = katex.renderToString(block.raw, {
          displayMode: block.display,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch (err) {
        console.warn("KaTeX rendering error for: " + block.raw, err);
        rendered = `<span class="text-rose-500 font-mono">${block.raw}</span>`;
      }
    } else {
      rendered = block.display ? `$$\n${block.raw}\n$$` : `$${block.raw}$`;
    }
    output = output.replace(block.token, rendered);
  });

  return output;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export function MarkdownRenderer({ text, className = "" }: MarkdownRendererProps) {
  const [katexLoaded, setKatexLoaded] = useState(false);

  // KaTeX Script and CSS injection logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).katex) {
      setKatexLoaded(true);
      return;
    }

    // 1. Add CSS
    if (!document.getElementById("katex-css")) {
      const link = document.createElement("link");
      link.id = "katex-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      document.head.appendChild(link);
    }

    // 2. Add JS
    if (!document.getElementById("katex-js")) {
      const script = document.createElement("script");
      script.id = "katex-js";
      script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
      script.async = true;
      script.onload = () => {
        setKatexLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load KaTeX script");
      };
      document.head.appendChild(script);
    } else {
      // If script tag is there but load callback is in progress
      const interval = setInterval(() => {
        if ((window as any).katex) {
          setKatexLoaded(true);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  const renderedHTML = useMemo(() => {
    if (!text) return "";

    // Protect escaped dollar signs
    let processedText = text.replace(/\\\\\$/g, "%%ESCAPED_DOLLAR%%");

    // 1. Extract math tokens
    const { processed, blocks } = extractMath(processedText);

    // 2. Parse Markdown elements
    let parsedHtml = parseMarkdown(processed);

    // 3. Restore escaped dollar signs
    parsedHtml = parsedHtml.replace(/%%ESCAPED_DOLLAR%%/g, "$");

    // 4. Render math blocks with KaTeX
    return renderMathTokens(parsedHtml, blocks);
  }, [text, katexLoaded]);

  return (
    <div
      className={`markdown-renderer leading-relaxed break-words text-slate-700 dark:text-slate-300 font-medium ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
    />
  );
}

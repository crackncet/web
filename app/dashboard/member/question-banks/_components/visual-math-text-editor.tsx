"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Sigma, Plus, Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { ref?: any; style?: any },
        HTMLElement
      >;
    }
  }
}

interface VisualMathTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onFocusField?: (id: string, setter: (val: string) => void, ref: any) => void;
  fieldId: string;
}

export function VisualMathTextEditor({
  value,
  onChange,
  placeholder = "",
  onFocusField,
  fieldId,
}: VisualMathTextEditorProps) {
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Setup Keyman focus handler when the textarea gains focus
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onFocusField) {
      onFocusField(fieldId, onChange, e.target);
    }
  };

  const handleInsertMath = (latexValue: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value;

    // Wrap equation in inline math delimiters
    const formattedMath = `$${latexValue}$`;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newValue = before + formattedMath + after;

    onChange(newValue);
    setIsMathModalOpen(false);

    // Refocus the textarea and position cursor right after the equation
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedMath.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  return (
    <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 p-2.5 focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex flex-col gap-1.5 min-h-[120px]">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="flex-1 w-full bg-transparent border-0 outline-hidden focus:ring-0 text-xs text-slate-800 dark:text-slate-200 resize-y min-h-[70px] font-sans leading-relaxed"
      />

      {/* Real-time formatted preview */}
      {value.trim() && (
        <div className="mt-1 space-y-1 shrink-0">
          <div className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 select-none">
            Live Preview:
          </div>
          <KaTeXPreview text={value} />
        </div>
      )}

      {/* Editor bottom bar toolbar */}
      <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-900/60 pt-1.5 shrink-0 select-none">
        <button
          type="button"
          onClick={() => setIsMathModalOpen(true)}
          className="h-6 px-2.5 text-[9px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 rounded-md border border-indigo-150 dark:border-indigo-900/40 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          title="Insert mathematical formula using visual editor"
        >
          <Sigma className="h-2.5 w-2.5" />
          Math Formula
        </button>
      </div>

      {/* Lightweight Math field modal portal */}
      <MathInputModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onInsert={handleInsertMath}
      />
    </div>
  );
}

// ─── KaTeX Live Preview Component ───────────────────────────────────────────
function KaTeXPreview({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const renderMath = () => {
      const renderMathInElement = (window as any).renderMathInElement;
      if (renderMathInElement && containerRef.current) {
        containerRef.current.textContent = text;
        try {
          renderMathInElement(containerRef.current, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
          });
        } catch (e) {
          console.warn("KaTeX rendering error", e);
        }
      }
    };

    renderMath();
    const timer = setTimeout(renderMath, 60);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="w-full text-xs text-slate-700 dark:text-slate-350 min-h-[1.5rem] p-2 bg-slate-50/50 dark:bg-slate-900/40 rounded-md border border-dashed border-slate-200 dark:border-slate-800 whitespace-pre-wrap break-words font-medium select-text"
    />
  );
}

// Sub-component for editing the equation visually
interface MathInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

function MathInputModal({ isOpen, onClose, onInsert }: MathInputModalProps) {
  const mfRef = useRef<any>(null);
  const [latex, setLatex] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Configure mathfield with local config once DOM renders
    setTimeout(() => {
      const mf = mfRef.current;
      if (mf) {
        // Ensure sharedVirtualKeyboard works and auto policy is used
        mf.mathVirtualKeyboardPolicy = "auto";
        mf.focus();
        
        const mvk = (window as any).mathVirtualKeyboard;
        if (mvk) {
          mvk.show();
        }
      }
    }, 100);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
            <Sigma className="h-4 w-4 text-indigo-500" />
            <span>Insert Visual Math Equation</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(!showHelp)}
              className={`h-7 w-7 rounded-full transition-all ${
                showHelp ? "text-indigo-650 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
              title="Show typing instructions & shortcuts"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {showHelp && (
          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-150 dark:border-slate-800 text-[10px] leading-relaxed text-slate-650 dark:text-slate-350 space-y-2 select-none animate-in slide-in-from-top-2 duration-150 shrink-0">
            <div className="font-bold text-slate-800 dark:text-slate-200 text-[9px] uppercase tracking-wider">
              Keyboard Shortcuts & Slash Commands
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-sans">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-1">
                <span className="text-slate-400">Real Numbers (ℝ)</span>
                <kbd className="bg-white dark:bg-slate-850 px-1 py-0.5 rounded border shadow-xs font-mono font-bold text-indigo-650 dark:text-indigo-400">\R + Space</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-1">
                <span className="text-slate-400">Right Arrow (→)</span>
                <kbd className="bg-white dark:bg-slate-850 px-1 py-0.5 rounded border shadow-xs font-mono font-bold text-indigo-650 dark:text-indigo-400">-&gt;</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-1">
                <span className="text-slate-400">Integers (ℤ)</span>
                <kbd className="bg-white dark:bg-slate-850 px-1 py-0.5 rounded border shadow-xs font-mono font-bold text-indigo-650 dark:text-indigo-400">\Z + Space</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-1">
                <span className="text-slate-400">Fraction (a/b)</span>
                <kbd className="bg-white dark:bg-slate-850 px-1 py-0.5 rounded border shadow-xs font-mono font-bold text-indigo-650 dark:text-indigo-400">/ or \frac</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-1">
                <span className="text-slate-400">Exponent (a²)</span>
                <kbd className="bg-white dark:bg-slate-850 px-1 py-0.5 rounded border shadow-xs font-mono font-bold text-indigo-650 dark:text-indigo-400">^ (Shift+6)</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-1">
                <span className="text-slate-400">Square Root (√)</span>
                <kbd className="bg-white dark:bg-slate-850 px-1 py-0.5 rounded border shadow-xs font-mono font-bold text-indigo-650 dark:text-indigo-400">\sqrt</kbd>
              </div>
            </div>
            <div className="text-[9px] text-slate-400 italic mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/40">
              Tip: Type a backslash <code className="bg-white dark:bg-slate-850 px-1 rounded font-mono text-indigo-500">\</code> followed by the LaTeX command, then press <kbd className="font-sans font-bold">Space</kbd> or <kbd className="font-sans font-bold">Enter</kbd> to insert any math symbol.
            </div>
          </div>
        )}

        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950/60 min-h-[80px] flex items-center justify-center">
          <math-field
            ref={mfRef}
            style={{
              width: "100%",
              outline: "none",
              background: "transparent",
              fontSize: "16px",
              color: "inherit",
            }}
            onInput={(e: any) => setLatex(e.target.value)}
          />
        </div>

        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <span>LaTeX Preview:</span>
          <code className="text-indigo-600 dark:text-indigo-400 font-mono select-all bg-indigo-50/50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30">
            {latex || "none"}
          </code>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => onInsert(latex)}
          >
            <Check className="h-3.5 w-3.5" />
            Insert Equation
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

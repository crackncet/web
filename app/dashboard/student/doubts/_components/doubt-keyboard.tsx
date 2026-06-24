"use client";

import { useState } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import SimpleKeyboardLayouts from "simple-keyboard-layouts";
import { Globe, Sigma, HelpCircle } from "lucide-react";

const layouts = new SimpleKeyboardLayouts();

export const KEYBOARD_MODES = [
  { name: "Math/LaTeX", id: "math" },
  { name: "Hindi", id: "@hi", locale: "hi" },
  { name: "Sanskrit", id: "@sa", locale: "sa" },
  { name: "Tamil", id: "@ta", locale: "ta" },
  { name: "Telugu", id: "@te", locale: "te" },
  { name: "Gujarati", id: "@gu", locale: "gu" },
  { name: "Marathi", id: "@mr", locale: "mr" },
  { name: "Urdu", id: "@ur", locale: "ur" },
];

const tamilLayout = {
  layout: {
    default: [
      "ஔ ா ி ீ ு ூ ெ ே ை ொ ோ ௌ ்",
      "அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ",
      "க ங ச ஞ ட ண த ந ப ம ய ர",
      "ல வ ழ ள ற ன {bksp}"
    ],
    shift: [
      "க் ங் ச் ஞ் ட் ண் த் ந் ப் ம் ய் ர்",
      "ல் வ் ழ் ள் ற் ன் {bksp}"
    ]
  }
};

const gujaratiLayout = {
  layout: {
    default: [
      "ઋ ા િ ી ુ ૂ ે ૈ ો ૌ ં ઃ ્",
      "અ આ ઇ ઈ ઉ ઊ એ ઐ ઓ ઔ ક ખ",
      "ગ ઘ ચ છ જ ઝ ટ ઠ ડ ઢ ણ ત",
      "થ દ ધ ન પ ફ બ ભ મ ય ર લ",
      "વ શ ષ સ હ ળ ક્ષ જ્ઞ {bksp}"
    ],
    shift: [
      "ઔ ઐ આ એ ઈ ઊ ઓ ઔ ક ખ",
      "ગ ઘ ચ છ જ ઝ ટ ઠ ડ ઢ ણ ત",
      "થ દ ધ ન પ ફ બ ભ મ ય ર લ",
      "વ શ ષ સ હ ળ ક્ષ જ્ઞ {bksp}"
    ]
  }
};

// Custom math symbols keyboard
const mathLayout = {
  layout: {
    default: [
      "\\alpha \\beta \\gamma \\theta \\lambda \\pi \\infty \\Delta \\mu \\sigma",
      "\\sin \\cos \\tan \\log \\ln \\sqrt{ } \\sum \\int \\partial \\nabla",
      "\\neq \\leq \\geq \\approx \\pm \\times \\div \\rightarrow \\Rightarrow \\Leftrightarrow",
      "{bksp} {space} {enter}"
    ]
  }
};

const getLayout = (modeId: string) => {
  if (modeId === "math") return mathLayout;
  const lang = modeId.replace("@", "").toLowerCase();
  switch (lang) {
    case "hi":
    case "sa":
    case "mr":
      return layouts.get("hindi");
    case "te":
      return layouts.get("telugu");
    case "ta":
      return tamilLayout;
    case "gu":
      return gujaratiLayout;
    case "ur":
      return layouts.get("urdu");
    default:
      return mathLayout;
  }
};

interface DoubtKeyboardProps {
  activeFieldRef: HTMLTextAreaElement | HTMLInputElement | null;
  activeFieldName?: string;
  onKeyPress?: (key: string) => void;
}

export function DoubtKeyboard({
  activeFieldRef,
  activeFieldName = "description",
  onKeyPress
}: DoubtKeyboardProps) {
  const [activeMode, setActiveMode] = useState<string>("math");
  const [layoutName, setLayoutName] = useState<string>("default");

  const setNativeValue = (
    element: HTMLTextAreaElement | HTMLInputElement,
    newValue: string
  ) => {
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (prototypeValueSetter && prototypeValueSetter !== valueSetter) {
      prototypeValueSetter.call(element, newValue);
    } else if (valueSetter) {
      valueSetter.call(element, newValue);
    } else {
      element.value = newValue;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const insertTextAtCursor = (
    textarea: HTMLTextAreaElement | HTMLInputElement,
    textToInsert: string
  ) => {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const value = textarea.value;
    const newValue = value.substring(0, start) + textToInsert + value.substring(end);
    
    setNativeValue(textarea, newValue);

    const newPos = start + textToInsert.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
  };

  const deleteCharacterAtCursor = (
    textarea: HTMLTextAreaElement | HTMLInputElement
  ) => {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const value = textarea.value;

    let newValue = "";
    let newPos = 0;

    if (start !== end) {
      newValue = value.substring(0, start) + value.substring(end);
      newPos = start;
    } else if (start > 0) {
      newValue = value.substring(0, start - 1) + value.substring(start);
      newPos = start - 1;
    } else {
      return;
    }

    setNativeValue(textarea, newValue);
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
  };

  const handleKeyPress = (button: string) => {
    if (onKeyPress) {
      onKeyPress(button);
    }

    if (!activeFieldRef) return;

    if (button === "{shift}" || button === "{lock}") {
      setLayoutName((prev) => (prev === "default" ? "shift" : "default"));
      return;
    }

    if (button === "{bksp}") {
      deleteCharacterAtCursor(activeFieldRef);
      return;
    }

    if (button === "{space}") {
      insertTextAtCursor(activeFieldRef, " ");
      return;
    }

    if (button === "{enter}") {
      insertTextAtCursor(activeFieldRef, "\n");
      return;
    }

    // Default key insertions
    insertTextAtCursor(activeFieldRef, button);
  };

  const currentLayout = getLayout(activeMode);

  return (
    <div className="flex flex-col gap-3.5 w-full bg-muted/20 border border-border rounded-xl p-4 shadow-sm">
      {/* CSS overrides for styling simple-keyboard */}
      <style dangerouslySetInnerHTML={{ __html: `
        .simple-keyboard {
          background-color: transparent !important;
          padding: 4px 0 0 0 !important;
        }
        .simple-keyboard .hg-row:not(:last-child) {
          margin-bottom: 4px !important;
        }
        .simple-keyboard .hg-row .hg-button:not(:last-child) {
          margin-right: 4px !important;
        }
        .simple-keyboard .hg-button {
          height: 44px !important;
          font-size: 14px !important;
          background: #ffffff !important;
          color: #334155 !important;
          border: 1px solid #e2e8f0 !important;
          border-bottom: 2px solid #cbd5e1 !important;
          border-radius: 8px !important;
          transition: background 0.15s ease, transform 0.05s ease !important;
          cursor: pointer;
        }
        .simple-keyboard .hg-button:active {
          background: #f1f5f9 !important;
          transform: translateY(1px) !important;
          border-bottom-width: 1px !important;
        }
        .dark .simple-keyboard .hg-button {
          background: #1e293b !important;
          color: #f1f5f9 !important;
          border: 1px solid #334155 !important;
          border-bottom: 2px solid #0f172a !important;
        }
        .dark .simple-keyboard .hg-button:active {
          background: #334155 !important;
        }
        .simple-keyboard .hg-button.hg-functionBtn {
          background: #f8fafc !important;
          font-weight: bold !important;
          font-size: 11px !important;
        }
        .dark .simple-keyboard .hg-button.hg-functionBtn {
          background: #0f172a !important;
        }
      `}} />

      {/* Mode selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Globe className="h-4 w-4" />
          <span>Keyboard Mode</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {KEYBOARD_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setActiveMode(mode.id);
                setLayoutName("default");
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                activeMode === mode.id
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-1">
                {mode.id === "math" && <Sigma className="h-3 w-3" />}
                <span>{mode.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active input information */}
      <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider -mt-1 select-none">
        <span>
          Target: <span className="text-primary font-bold">{activeFieldName}</span>
        </span>
        <span className="flex items-center gap-1 text-[9px] lowercase italic normal-case">
          <HelpCircle className="h-3 w-3" />
          Supports physical typing as well
        </span>
      </div>

      {/* Keypad frame */}
      <div
        onMouseDown={(e) => e.preventDefault()}
        className="w-full rounded-lg border border-border bg-card p-1.5 shadow-inner"
      >
        <Keyboard
          layoutName={layoutName}
          layout={(currentLayout?.layout || currentLayout) as any}
          onKeyPress={handleKeyPress}
          theme="simple-keyboard hg-theme-default"
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import SimpleKeyboardLayouts from "simple-keyboard-layouts";
import { Globe } from "lucide-react";

// Initialize SimpleKeyboardLayouts
const layouts = new SimpleKeyboardLayouts();

export const INDIAN_LANGUAGES = [
  { name: "Hindi",     id: "@hi", locale: "hi" },
  { name: "Sanskrit",  id: "@sa", locale: "sa" },
  { name: "Tamil",     id: "@ta", locale: "ta" },
  { name: "Telugu",    id: "@te", locale: "te" },
  { name: "Bengali",   id: "@bn", locale: "bn" },
  { name: "Gujarati",  id: "@gu", locale: "gu" },
  { name: "Marathi",   id: "@mr", locale: "mr" },
  { name: "Kannada",   id: "@kn", locale: "kn" },
  { name: "Malayalam", id: "@ml", locale: "ml" },
  { name: "Punjabi",   id: "@pa", locale: "pa" },
  { name: "Odia",      id: "@or", locale: "or" },
  { name: "Urdu",      id: "@ur", locale: "ur" },
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

const getLayout = (locale: string) => {
  const lang = locale.replace("@", "").toLowerCase();
  switch (lang) {
    case "hi":
    case "sa":
    case "mr":
      return layouts.get("hindi");
    case "te":
      return layouts.get("telugu");
    case "bn":
      return layouts.get("bengali");
    case "kn":
      return layouts.get("kannada");
    case "ml":
      return layouts.get("malayalam");
    case "pa":
      return layouts.get("punjabi");
    case "or":
      return layouts.get("odia");
    case "ur":
      return layouts.get("urdu");
    case "ta":
      return tamilLayout;
    case "gu":
      return gujaratiLayout;
    default:
      return layouts.get("hindi");
  }
};

interface KeymanOskPanelProps {
  activeField: {
    id: string;
    ref: HTMLTextAreaElement | HTMLInputElement | null;
  } | null;
  selectedLocale: string;        // e.g. "@hi", "@kn"
  onLocaleChange: (id: string) => void;
}

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

  // Set selection range right after the inserted character
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

export function KeymanOskPanel({
  activeField,
  selectedLocale,
  onLocaleChange,
}: KeymanOskPanelProps) {
  const [layoutName, setLayoutName] = useState<string>("default");

  const handleKeyPress = (button: string) => {
    if (!activeField?.ref) return;

    const textarea = activeField.ref;

    if (button === "{shift}" || button === "{lock}") {
      setLayoutName((prev) => (prev === "default" ? "shift" : "default"));
      return;
    }

    if (button === "{bksp}") {
      deleteCharacterAtCursor(textarea);
      return;
    }

    if (button === "{space}") {
      insertTextAtCursor(textarea, " ");
      return;
    }

    if (button === "{enter}") {
      insertTextAtCursor(textarea, "\n");
      return;
    }

    // Insert key character
    insertTextAtCursor(textarea, button);
  };

  const currentLayout = getLayout(selectedLocale);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Styles injector for custom simple-keyboard theme */}
      <style dangerouslySetInnerHTML={{ __html: `
        .simple-keyboard {
          background-color: transparent !important;
          padding: 4px 0 0 0 !important;
          font-family: inherit !important;
        }
        .simple-keyboard .hg-row:not(:last-child) {
          margin-bottom: 4px !important;
        }
        .simple-keyboard .hg-row .hg-button:not(:last-child) {
          margin-right: 4px !important;
        }
        .simple-keyboard .hg-button {
          height: 48px !important;
          font-size: 15px !important;
          background: #ffffff !important;
          color: #334155 !important;
          border: 1px solid #e2e8f0 !important;
          border-bottom: 2px solid #cbd5e1 !important;
          border-radius: 6px !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          transition: background 0.15s ease, transform 0.05s ease !important;
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
          box-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
        }
        .dark .simple-keyboard .hg-button:active {
          background: #334155 !important;
        }
        .simple-keyboard .hg-button.hg-functionBtn {
          background: #f8fafc !important;
          font-weight: bold !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
        }
        .dark .simple-keyboard .hg-button.hg-functionBtn {
          background: #0f172a !important;
        }
      `}} />

      {/* Language pill selector */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-1 shrink-0">
          <Globe className="h-3.5 w-3.5" />
          Language
        </div>
        <div className="flex flex-wrap gap-1.5">
          {INDIAN_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onLocaleChange(lang.id);
                setLayoutName("default"); // reset shift on locale switch
              }}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                selectedLocale === lang.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-400"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active-field breadcrumb */}
      {activeField && (
        <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider -mt-1">
          Typing into:{" "}
          <span className="text-indigo-500 dark:text-indigo-400">
            {activeField.id}
          </span>
        </div>
      )}

      {/* Virtual Keyboard rendering */}
      <div 
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 overflow-hidden shadow-inner"
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

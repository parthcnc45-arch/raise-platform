"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers shared with the pages that display the saved HTML
// ---------------------------------------------------------------------------

const BLOCKED_TAGS = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "FORM", "INPUT", "BUTTON"]);

// Removes anything that could run code (scripts, event handlers, javascript: links).
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || !html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");

  const walk = (node: Element) => {
    Array.from(node.children).forEach((child) => {
      if (BLOCKED_TAGS.has(child.tagName)) {
        child.remove();
        return;
      }
      Array.from(child.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const val = attr.value.trim().toLowerCase();
        if (name.startsWith("on")) child.removeAttribute(attr.name);
        else if ((name === "href" || name === "src") && !/^(https?:|mailto:|#)/.test(val)) {
          child.removeAttribute(attr.name);
        }
      });
      if (child.tagName === "A") {
        child.setAttribute("target", "_blank");
        child.setAttribute("rel", "noopener noreferrer");
      }
      walk(child);
    });
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

export const htmlToTextLength = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").length;

// Rendering classes for the formatted content (lists and links are reset by Tailwind's preflight)
export const richContentCls =
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#1F5FBF] [&_a]:underline break-words";

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

const FONTS = ["Arial", "Georgia", "Times New Roman", "Verdana", "Courier New", "Tahoma"];

const SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Huge", value: "6" },
];

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  ariaLabel: string;
};

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // keep the text selection inside the editor while clicking toolbar buttons
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-slate-700 transition hover:bg-slate-200"
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px bg-slate-300" />;

export default function RichTextEditor({ value, onChange, minHeight = 180, ariaLabel }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  // Load external value changes (e.g. a restored draft) without disturbing the caret while typing
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) el.innerHTML = sanitizeHtml(value);
  }, [value]);

  // Remember the last selection inside the editor so dropdowns and colour pickers can restore it
  useEffect(() => {
    const remember = () => {
      const sel = window.getSelection();
      const el = editorRef.current;
      if (sel && sel.rangeCount > 0 && el && el.contains(sel.anchorNode)) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
      }
    };
    document.addEventListener("selectionchange", remember);
    return () => document.removeEventListener("selectionchange", remember);
  }, []);

  const emit = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(html === "<br>" ? "" : html);
  }, [onChange]);

  const run = (command: string, arg?: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    document.execCommand("styleWithCSS", false, "true");
    const ok = document.execCommand(command, false, arg);
    if (!ok && command === "hiliteColor") document.execCommand("backColor", false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Enter the link URL (https://…)");
    if (!url) return;
    const trimmed = url.trim();
    if (!/^(https?:\/\/|mailto:)/i.test(trimmed)) {
      window.alert("Links must start with http://, https:// or mailto:");
      return;
    }
    run("createLink", trimmed);
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm focus-within:border-[#2d9ab7] focus-within:ring-2 focus-within:ring-[#2d9ab7]/20">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <ToolButton label="Bold" onClick={() => run("bold")}><Bold className="h-4 w-4" /></ToolButton>
        <ToolButton label="Italic" onClick={() => run("italic")}><Italic className="h-4 w-4" /></ToolButton>
        <ToolButton label="Underline" onClick={() => run("underline")}><Underline className="h-4 w-4" /></ToolButton>
        <Divider />

        <select
          aria-label="Font"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) run("fontName", e.target.value);
            e.target.value = "";
          }}
          className="h-7 rounded border border-transparent bg-transparent px-1 text-xs text-slate-700 hover:bg-slate-200"
        >
          <option value="">Font</option>
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select
          aria-label="Size"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) run("fontSize", e.target.value);
            e.target.value = "";
          }}
          className="h-7 rounded border border-transparent bg-transparent px-1 text-xs text-slate-700 hover:bg-slate-200"
        >
          <option value="">Size</option>
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <Divider />

        <label title="Text color" className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-slate-200">
          <span className="text-sm font-bold leading-none text-red-600">A</span>
          <input
            type="color"
            aria-label="Text color"
            defaultValue="#dc2626"
            onChange={(e) => run("foreColor", e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <label title="Highlight color" className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-slate-200">
          <Highlighter className="h-4 w-4 text-amber-500" />
          <input
            type="color"
            aria-label="Highlight color"
            defaultValue="#fde047"
            onChange={(e) => run("hiliteColor", e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <ToolButton label="Clear formatting" onClick={() => run("removeFormat")}><Eraser className="h-4 w-4" /></ToolButton>
        <Divider />

        <ToolButton label="Align left" onClick={() => run("justifyLeft")}><AlignLeft className="h-4 w-4" /></ToolButton>
        <ToolButton label="Align center" onClick={() => run("justifyCenter")}><AlignCenter className="h-4 w-4" /></ToolButton>
        <ToolButton label="Align right" onClick={() => run("justifyRight")}><AlignRight className="h-4 w-4" /></ToolButton>
        <ToolButton label="Increase indent" onClick={() => run("indent")}><IndentIncrease className="h-4 w-4" /></ToolButton>
        <ToolButton label="Decrease indent" onClick={() => run("outdent")}><IndentDecrease className="h-4 w-4" /></ToolButton>
        <Divider />

        <ToolButton label="Numbered list" onClick={() => run("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolButton>
        <ToolButton label="Bulleted list" onClick={() => run("insertUnorderedList")}><List className="h-4 w-4" /></ToolButton>
        <ToolButton label="Insert link" onClick={addLink}><LinkIcon className="h-4 w-4" /></ToolButton>
      </div>

      {/* Editing area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          // Paste as plain text so no foreign markup or styles get into the profile
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        style={{ minHeight }}
        className={`px-4 py-3 text-[13px] leading-relaxed text-slate-800 outline-none ${richContentCls}`}
      />

      {/* Footer with the character counter */}
      <div className="flex justify-end bg-[#dbe5f1] px-3 py-1.5 text-[11px] text-slate-600">
        characters: {htmlToTextLength(value)}
      </div>
    </div>
  );
}

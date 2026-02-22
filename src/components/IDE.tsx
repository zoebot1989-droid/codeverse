"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { themes, Theme } from "@/lib/themes";
import { highlightLine } from "@/lib/highlighter";
import { FileNode, getLanguage, getFileIcon } from "@/lib/defaultFiles";
import { loadFiles, saveFiles, loadTree, saveTree, resetFiles, addFileToTree, deleteFromTree, renameInTree } from "@/lib/fileSystem";
import { TerminalState, createTerminal, executeCommand, getCompletions } from "@/lib/terminal";

// ===== File Explorer =====
function FileExplorer({
  tree, onFileSelect, activeFile, onContextMenu
}: {
  tree: FileNode; onFileSelect: (path: string) => void; activeFile: string;
  onContextMenu: (e: React.MouseEvent, path: string, type: "file"|"folder") => void;
}) {
  return (
    <div className="h-full overflow-auto text-sm select-none">
      <TreeNode node={tree} path="" onFileSelect={onFileSelect} activeFile={activeFile} onContextMenu={onContextMenu} depth={0} />
    </div>
  );
}

function TreeNode({
  node, path, onFileSelect, activeFile, onContextMenu, depth
}: {
  node: FileNode; path: string; onFileSelect: (p: string) => void; activeFile: string;
  onContextMenu: (e: React.MouseEvent, path: string, type: "file"|"folder") => void; depth: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const currentPath = path ? `${path}/${node.name}` : node.name;

  if (node.type === "file") {
    const isActive = activeFile === currentPath;
    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-0.5 cursor-pointer hover:bg-white/5 ${isActive ? "bg-white/10" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onFileSelect(currentPath)}
        onContextMenu={(e) => onContextMenu(e, currentPath, "file")}
      >
        <span className="text-xs">{getFileIcon(node.name)}</span>
        <span className="truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 cursor-pointer hover:bg-white/5"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => setOpen(!open)}
        onContextMenu={(e) => onContextMenu(e, currentPath, "folder")}
      >
        <span className="text-xs">{open ? "▾" : "▸"}</span>
        <span className="text-xs">📁</span>
        <span className="truncate font-medium">{node.name}</span>
      </div>
      {open && node.children?.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      }).map((child) => (
        <TreeNode key={child.name} node={child} path={currentPath} onFileSelect={onFileSelect} activeFile={activeFile} onContextMenu={onContextMenu} depth={depth + 1} />
      ))}
    </div>
  );
}

// ===== Editor =====
function Editor({
  content, language, theme, onChange, onCursorChange
}: {
  content: string; language: string; theme: Theme; onChange: (v: string) => void;
  onCursorChange: (line: number, col: number) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [cursorLine, setCursorLine] = useState(0);

  const lines = useMemo(() => content.split("\n"), [content]);
  const highlighted = useMemo(
    () => lines.map((line) => highlightLine(line, language, theme)),
    [lines, language, theme]
  );

  const handleScroll = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      setScrollTop(el.scrollTop);
      if (highlightRef.current) highlightRef.current.scrollTop = el.scrollTop;
      if (lineNumRef.current) lineNumRef.current.scrollTop = el.scrollTop;
    }
  }, []);

  const handleCursor = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    const before = content.slice(0, pos);
    const line = before.split("\n").length;
    const col = pos - before.lastIndexOf("\n");
    setCursorLine(line - 1);
    onCursorChange(line, col);
  }, [content, onCursorChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const el = textareaRef.current;
      if (!el) return;

      // Tab indent
      if (e.key === "Tab") {
        e.preventDefault();
        const start = el.selectionStart;
        const end = el.selectionEnd;
        if (e.shiftKey) {
          // Outdent
          const before = content.slice(0, start);
          const lineStart = before.lastIndexOf("\n") + 1;
          const lineText = content.slice(lineStart, end);
          if (lineText.startsWith("  ")) {
            const newContent = content.slice(0, lineStart) + lineText.slice(2) + content.slice(end);
            onChange(newContent);
            setTimeout(() => { el.selectionStart = el.selectionEnd = Math.max(start - 2, lineStart); }, 0);
          }
        } else {
          const newContent = content.slice(0, start) + "  " + content.slice(end);
          onChange(newContent);
          setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2; }, 0);
        }
        return;
      }

      // Enter - auto indent
      if (e.key === "Enter") {
        e.preventDefault();
        const start = el.selectionStart;
        const before = content.slice(0, start);
        const lineStart = before.lastIndexOf("\n") + 1;
        const currentLine = before.slice(lineStart);
        const indent = currentLine.match(/^\s*/)?.[0] || "";
        const lastChar = before.trimEnd().slice(-1);
        const extra = ["{", "(", "[", ":"].includes(lastChar) ? "  " : "";
        const insertion = "\n" + indent + extra;
        const newContent = content.slice(0, start) + insertion + content.slice(el.selectionEnd);
        onChange(newContent);
        setTimeout(() => { el.selectionStart = el.selectionEnd = start + insertion.length; }, 0);
        return;
      }

      // Ctrl+/ toggle comment
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const start = el.selectionStart;
        const before = content.slice(0, start);
        const lineStart = before.lastIndexOf("\n") + 1;
        const lineEnd = content.indexOf("\n", start);
        const line = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
        const commentPrefixes: Record<string, string> = { javascript: "// ", typescript: "// ", css: "/* ", python: "# ", html: "<!-- " };
        const prefix = commentPrefixes[language] || "// ";
        let newContent: string;
        if (line.trimStart().startsWith(prefix.trim())) {
          const idx = line.indexOf(prefix.trim());
          newContent = content.slice(0, lineStart) + line.slice(0, idx) + line.slice(idx + prefix.length) + content.slice(lineEnd === -1 ? content.length : lineEnd);
        } else {
          const indent = line.match(/^\s*/)?.[0] || "";
          newContent = content.slice(0, lineStart) + indent + prefix + line.slice(indent.length) + content.slice(lineEnd === -1 ? content.length : lineEnd);
        }
        onChange(newContent);
        return;
      }

      // Auto-close brackets
      const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
      if (pairs[e.key]) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        if (start !== end) {
          // Wrap selection
          e.preventDefault();
          const selected = content.slice(start, end);
          const newContent = content.slice(0, start) + e.key + selected + pairs[e.key] + content.slice(end);
          onChange(newContent);
          setTimeout(() => { el.selectionStart = start + 1; el.selectionEnd = end + 1; }, 0);
        }
      }
    },
    [content, onChange, language]
  );

  return (
    <div className="relative h-full overflow-hidden" style={{ background: theme.bg }}>
      {/* Line numbers */}
      <div
        ref={lineNumRef}
        className="absolute left-0 top-0 bottom-0 w-[50px] overflow-hidden editor-font text-right pr-3 select-none z-10"
        style={{ color: theme.lineNumber, background: theme.bg }}
      >
        <div style={{ transform: `translateY(${-scrollTop}px)` }}>
          {lines.map((_, i) => (
            <div key={i} className="leading-[1.6]" style={i === cursorLine ? { color: theme.text } : undefined}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Highlight layer */}
      <div
        ref={highlightRef}
        className="absolute left-[50px] top-0 right-0 bottom-0 overflow-hidden editor-font pointer-events-none whitespace-pre"
        style={{ color: theme.text }}
      >
        <div style={{ transform: `translateY(${-scrollTop}px)`, padding: "0 16px" }}>
          {highlighted.map((html, i) => (
            <div
              key={i}
              className="leading-[1.6]"
              style={i === cursorLine ? { background: theme.lineHighlight } : undefined}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyUp={handleCursor}
        onClick={handleCursor}
        onKeyDown={handleKeyDown}
        className="absolute left-[50px] top-0 right-0 bottom-0 editor-font resize-none outline-none bg-transparent caret-white whitespace-pre overflow-auto"
        style={{ color: "transparent", padding: "0 16px", caretColor: theme.text }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </div>
  );
}

// ===== Terminal =====
function Terminal({
  state, onExecute, theme, files
}: {
  state: TerminalState; onExecute: (cmd: string) => void; theme: Theme; files: Record<string, string>;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.lines]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onExecute(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(state.historyIndex + 1, state.history.length - 1);
      if (state.history[idx]) setInput(state.history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = state.historyIndex - 1;
      if (idx < 0) setInput("");
      else if (state.history[idx]) setInput(state.history[idx]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const completions = getCompletions(input, files, state.cwd);
      if (completions.length === 1) {
        const parts = input.split(/\s+/);
        parts[parts.length - 1] = completions[0];
        setInput(parts.join(" "));
      } else if (completions.length > 1) {
        onExecute(""); // Show completions in output
      }
    }
  };

  return (
    <div
      className="h-full overflow-auto editor-font text-sm p-2 cursor-text"
      style={{ background: theme.terminal, color: theme.text }}
      onClick={() => inputRef.current?.focus()}
    >
      {state.lines.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap" style={{
          color: line.type === "error" ? "#f44747" : line.type === "input" ? theme.accent : theme.text
        }}>
          {line.text}
        </div>
      ))}
      <div className="flex items-center">
        <span style={{ color: "#6a9955" }}>user@codeverse</span>
        <span style={{ color: theme.text }}>:</span>
        <span style={{ color: "#569cd6" }}>{state.cwd}</span>
        <span style={{ color: theme.text }}>$ </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none caret-white"
          style={{ color: theme.text, fontFamily: "inherit" }}
          spellCheck={false}
          autoFocus
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

// ===== File Search Dialog =====
function FileSearch({
  files, onSelect, onClose
}: {
  files: Record<string, string>; onSelect: (path: string) => void; onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filePaths = Object.keys(files);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = filePaths.filter((f) =>
    f.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div
        className="w-[500px] max-w-[90vw] rounded-lg shadow-2xl border overflow-hidden"
        style={{ background: "#252526", borderColor: "#007acc" }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && filtered.length > 0) {
              onSelect(filtered[0]);
              onClose();
            }
          }}
          className="w-full p-3 bg-transparent outline-none text-white editor-font"
          placeholder="Search files..."
        />
        <div className="max-h-[300px] overflow-auto">
          {filtered.map((f) => (
            <div
              key={f}
              className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-sm flex items-center gap-2"
              onClick={() => { onSelect(f); onClose(); }}
            >
              <span>{getFileIcon(f.split("/").pop() || "")}</span>
              <span className="text-gray-300">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Context Menu =====
function ContextMenu({
  x, y, type, onAction, onClose
}: {
  x: number; y: number; type: "file"|"folder"; onAction: (action: string) => void; onClose: () => void;
}) {
  const items = type === "folder"
    ? [{ label: "New File", action: "newFile" }, { label: "New Folder", action: "newFolder" }, { label: "Rename", action: "rename" }, { label: "Delete", action: "delete" }]
    : [{ label: "Rename", action: "rename" }, { label: "Delete", action: "delete" }];

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 rounded shadow-xl border py-1 text-sm min-w-[160px]"
      style={{ left: x, top: y, background: "#252526", borderColor: "#3e3e42" }}
    >
      {items.map((item) => (
        <div
          key={item.action}
          className="px-3 py-1.5 hover:bg-blue-600/50 cursor-pointer text-gray-300"
          onClick={(e) => { e.stopPropagation(); onAction(item.action); onClose(); }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

// ===== Save Toast =====
function SaveToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
    >
      ✓ Saved to localStorage
    </motion.div>
  );
}

// ===== Live Preview =====
function LivePreview({ files, theme, previewMode }: { files: Record<string, string>; theme: Theme; previewMode: string }) {
  const html = files["demo-project/index.html"] || "";
  const css = files["demo-project/style.css"] || "";
  const js = files["demo-project/app.js"] || "";

  const srcdoc = `<!DOCTYPE html>
<html>
<head><style>${css}</style></head>
<body>${html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<link.*?>/g, "").replace(/<!DOCTYPE.*?>/i, "").replace(/<html.*?>|<\/html>|<head>[\s\S]*?<\/head>/gi, "")}
<script>${js}<\/script>
</body></html>`;

  const widths: Record<string, string> = { desktop: "100%", tablet: "768px", mobile: "375px" };

  return (
    <div className="h-full flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-2 px-3 py-1 border-b text-xs" style={{ borderColor: theme.border, color: theme.textSecondary }}>
        <span>Preview</span>
        <div className="flex-1" />
        <span className="opacity-50">Mode: {previewMode}</span>
      </div>
      <div className="flex-1 flex items-start justify-center overflow-auto p-2" style={{ background: "#1a1a1a" }}>
        <iframe
          srcDoc={srcdoc}
          className="bg-white rounded"
          style={{ width: widths[previewMode], height: "100%", border: "none", maxWidth: "100%" }}
          sandbox="allow-scripts"
          title="Live Preview"
        />
      </div>
    </div>
  );
}

// ===== MAIN IDE =====
export default function IDE() {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [tree, setTree] = useState<FileNode>({ name: "demo-project", type: "folder", children: [] });
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState("");
  const [themeName, setThemeName] = useState("Dark+");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [termState, setTermState] = useState<TerminalState>(createTerminal());
  const [showFileSearch, setShowFileSearch] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; type: "file"|"folder" } | null>(null);
  const [showSave, setShowSave] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);

  const theme = themes[themeName];

  // Load from localStorage
  useEffect(() => {
    const f = loadFiles();
    const t = loadTree();
    setFiles(f);
    setTree(t);
    // Open README by default
    const readmePath = "demo-project/README.md";
    if (f[readmePath]) {
      setOpenTabs([readmePath]);
      setActiveFile(readmePath);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveFiles(files);
        saveTree(tree);
        setShowSave(true);
        setTimeout(() => setShowSave(false), 1500);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        setShowTerminal((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setShowSidebar((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setShowFileSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [files, tree]);

  const openFile = useCallback((path: string) => {
    if (!openTabs.includes(path)) setOpenTabs((t) => [...t, path]);
    setActiveFile(path);
  }, [openTabs]);

  const closeTab = useCallback((path: string) => {
    setOpenTabs((tabs) => {
      const next = tabs.filter((t) => t !== path);
      if (activeFile === path) setActiveFile(next[next.length - 1] || "");
      return next;
    });
  }, [activeFile]);

  const updateFile = useCallback((content: string) => {
    setFiles((f) => {
      const updated = { ...f, [activeFile]: content };
      saveFiles(updated);
      return updated;
    });
  }, [activeFile]);

  const handleReset = useCallback(() => {
    const { files: f, tree: t } = resetFiles();
    setFiles(f);
    setTree(t);
    setOpenTabs([]);
    setActiveFile("");
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, path: string, type: "file"|"folder") => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, path, type });
  }, []);

  const handleContextAction = useCallback((action: string) => {
    if (!contextMenu) return;
    const { path, type } = contextMenu;

    if (action === "delete") {
      const newTree = deleteFromTree(tree, path);
      setTree(newTree);
      saveTree(newTree);
      const newFiles = { ...files };
      Object.keys(newFiles).forEach((k) => { if (k.startsWith(path)) delete newFiles[k]; });
      setFiles(newFiles);
      saveFiles(newFiles);
      closeTab(path);
    } else if (action === "rename") {
      const name = prompt("New name:", path.split("/").pop());
      if (name) {
        const newTree = renameInTree(tree, path, name);
        setTree(newTree);
        saveTree(newTree);
        // Update file paths
        const newFiles: Record<string, string> = {};
        const oldPrefix = path;
        const parentPath = path.split("/").slice(0, -1).join("/");
        const newPath = parentPath ? `${parentPath}/${name}` : name;
        Object.entries(files).forEach(([k, v]) => {
          if (k === oldPrefix || k.startsWith(oldPrefix + "/")) {
            newFiles[k.replace(oldPrefix, newPath)] = v;
          } else {
            newFiles[k] = v;
          }
        });
        setFiles(newFiles);
        saveFiles(newFiles);
      }
    } else if (action === "newFile" || action === "newFolder") {
      const name = prompt(`New ${action === "newFile" ? "file" : "folder"} name:`);
      if (name) {
        const newTree = addFileToTree(tree, path, name, action === "newFile" ? "file" : "folder");
        setTree(newTree);
        saveTree(newTree);
        if (action === "newFile") {
          const newPath = `${path}/${name}`;
          setFiles((f) => { const n = { ...f, [newPath]: "" }; saveFiles(n); return n; });
          openFile(newPath);
        }
      }
    }
  }, [contextMenu, tree, files, closeTab, openFile]);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const activeLanguage = activeFile ? getLanguage(activeFile.split("/").pop() || "") : "plaintext";

  // Terminal drag resize
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragRef.current) {
        const delta = dragRef.current.startY - e.clientY;
        setTerminalHeight(Math.max(100, Math.min(500, dragRef.current.startH + delta)));
      }
    };
    const up = () => { dragRef.current = null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: theme.bg, color: theme.text }}
    >
      {/* Title Bar */}
      <div className="flex items-center h-9 px-3 gap-3 shrink-0 text-xs select-none" style={{ background: theme.titlebar, borderBottom: `1px solid ${theme.border}` }}>
        <span className="font-bold text-sm" style={{ color: theme.accent }}>⚡ CodeVerse</span>
        <span className="text-gray-500">{activeFile ? activeFile.split("/").pop() : ""}</span>
        <div className="flex-1" />
        
        {/* Theme selector */}
        <select
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          className="bg-transparent border rounded px-2 py-0.5 text-xs outline-none cursor-pointer"
          style={{ borderColor: theme.border, color: theme.textSecondary }}
        >
          {Object.keys(themes).map((t) => (
            <option key={t} value={t} style={{ background: "#252526" }}>{t}</option>
          ))}
        </select>

        {/* Layout toggles */}
        <button onClick={() => setShowSidebar((v) => !v)} className={`px-2 py-0.5 rounded hover:bg-white/10 ${showSidebar ? "text-white" : "text-gray-500"}`} title="Toggle Sidebar (Ctrl+B)">☰</button>
        <button onClick={() => setShowTerminal((v) => !v)} className={`px-2 py-0.5 rounded hover:bg-white/10 ${showTerminal ? "text-white" : "text-gray-500"}`} title="Toggle Terminal (Ctrl+`)">⌨</button>
        <button onClick={() => setShowPreview((v) => !v)} className={`px-2 py-0.5 rounded hover:bg-white/10 ${showPreview ? "text-white" : "text-gray-500"}`} title="Toggle Preview">👁</button>
        
        {showPreview && (
          <div className="flex gap-1 ml-1">
            {["desktop", "tablet", "mobile"].map((m) => (
              <button key={m} onClick={() => setPreviewMode(m)} className={`px-1.5 py-0.5 rounded text-[10px] ${previewMode === m ? "bg-white/20" : "hover:bg-white/10"}`}>
                {m === "desktop" ? "🖥" : m === "tablet" ? "📱" : "📱"}
              </button>
            ))}
          </div>
        )}

        <span className="text-gray-600 ml-2" title="Ctrl+P to search, Ctrl+S to save">⌘</span>
        <button onClick={handleReset} className="px-2 py-0.5 rounded hover:bg-red-500/20 text-red-400 text-[10px]" title="Reset to default files">Reset</button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-[220px] shrink-0 flex flex-col overflow-hidden" style={{ background: theme.sidebar, borderRight: `1px solid ${theme.border}` }}>
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Explorer
            </div>
            <div className="flex-1 overflow-auto">
              <FileExplorer tree={tree} onFileSelect={openFile} activeFile={activeFile} onContextMenu={handleContextMenu} />
            </div>
          </div>
        )}

        {/* Editor + Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex items-center h-[35px] shrink-0 overflow-x-auto" style={{ background: theme.tabInactive, borderBottom: `1px solid ${theme.border}` }}>
              {openTabs.map((tab) => (
                <div
                  key={tab}
                  className={`flex items-center gap-1.5 px-3 h-full text-xs cursor-pointer border-r shrink-0 group`}
                  style={{
                    background: tab === activeFile ? theme.tabActive : "transparent",
                    borderColor: theme.border,
                    borderTop: tab === activeFile ? `2px solid ${theme.accent}` : "2px solid transparent",
                    color: tab === activeFile ? theme.text : theme.textSecondary,
                  }}
                  onClick={() => setActiveFile(tab)}
                >
                  <span className="text-[10px]">{getFileIcon(tab.split("/").pop() || "")}</span>
                  <span>{tab.split("/").pop()}</span>
                  <button
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded px-0.5"
                    onClick={(e) => { e.stopPropagation(); closeTab(tab); }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor + Preview Split */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              {activeFile && files[activeFile] !== undefined ? (
                <Editor
                  content={files[activeFile]}
                  language={activeLanguage}
                  theme={theme}
                  onChange={updateFile}
                  onCursorChange={(line, col) => setCursorPos({ line, col })}
                />
              ) : (
                <div className="h-full flex items-center justify-center" style={{ color: theme.textSecondary }}>
                  <div className="text-center">
                    <div className="text-6xl mb-4 opacity-20">⚡</div>
                    <div className="text-lg">CodeVerse</div>
                    <div className="text-sm mt-2 opacity-50">Open a file to start editing</div>
                    <div className="text-xs mt-4 opacity-30">Ctrl+P to search • Ctrl+B toggle sidebar • Ctrl+` toggle terminal</div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="w-[40%] shrink-0" style={{ borderLeft: `1px solid ${theme.border}` }}>
                <LivePreview files={files} theme={theme} previewMode={previewMode} />
              </div>
            )}
          </div>

          {/* Terminal */}
          {showTerminal && (
            <>
              <div
                className="h-1 cursor-row-resize hover:bg-blue-500/50 shrink-0"
                style={{ background: theme.border }}
                onMouseDown={(e) => { dragRef.current = { startY: e.clientY, startH: terminalHeight }; }}
              />
              <div className="shrink-0" style={{ height: terminalHeight, borderTop: `1px solid ${theme.border}` }}>
                <Terminal
                  state={termState}
                  onExecute={(cmd) => setTermState((s) => executeCommand(s, cmd, files))}
                  theme={theme}
                  files={files}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center h-[22px] px-3 text-[11px] shrink-0 select-none" style={{ background: theme.statusbar, color: "white" }}>
        <span>{activeLanguage}</span>
        <span className="mx-3">Ln {cursorPos.line}, Col {cursorPos.col}</span>
        <span className="mr-3">UTF-8</span>
        <span>Spaces: 2</span>
        <div className="flex-1" />
        <span className="opacity-70">Built by AI with ❤️</span>
      </div>

      {/* File Search */}
      {showFileSearch && (
        <FileSearch files={files} onSelect={openFile} onClose={() => setShowFileSearch(false)} />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Save Toast */}
      <SaveToast show={showSave} />
    </motion.div>
  );
}

import { Theme } from "./themes";

interface Token {
  text: string;
  type: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tokenizeJS(line: string): Token[] {
  const tokens: Token[] = [];
  const keywords = /^(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|yield|void|delete|true|false|null|undefined)$/;
  const re = /(\/\/.*$|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+\.?\d*\b|[a-zA-Z_$][\w$]*(?=\s*\()|[a-zA-Z_$][\w$]*|[{}()\[\];,.:?]|=>|[+\-*/%=!<>&|^~]+|\s+|.)/gm;
  let m;
  while ((m = re.exec(line)) !== null) {
    const t = m[0];
    if (t.startsWith("//") || t.startsWith("/*")) tokens.push({ text: t, type: "comment" });
    else if (t.startsWith('"') || t.startsWith("'") || t.startsWith("`")) tokens.push({ text: t, type: "string" });
    else if (/^\d/.test(t)) tokens.push({ text: t, type: "number" });
    else if (keywords.test(t)) tokens.push({ text: t, type: "keyword" });
    else if (/^[a-zA-Z_$][\w$]*$/.test(t) && re.lastIndex < line.length && line[re.lastIndex - t.length + t.length] === undefined) {
      // Check if it was matched as function call
      if (m[0] === t && re.source.includes("(?=\\s*\\()")) {
        tokens.push({ text: t, type: "text" });
      } else {
        tokens.push({ text: t, type: "text" });
      }
    }
    else tokens.push({ text: t, type: "text" });
  }
  return tokens;
}

function tokenizeJSProperly(line: string): Token[] {
  const tokens: Token[] = [];
  const keywords = new Set(["const","let","var","function","return","if","else","for","while","do","switch","case","break","continue","class","extends","new","this","super","import","export","from","default","async","await","try","catch","finally","throw","typeof","instanceof","in","of","yield","void","delete"]);
  const constants = new Set(["true","false","null","undefined","NaN","Infinity"]);
  const builtins = new Set(["console","document","window","Math","Array","Object","String","Number","Promise","Date","JSON","Map","Set","Error","RegExp","parseInt","parseFloat","setTimeout","setInterval","clearTimeout","clearInterval","fetch"]);

  let i = 0;
  while (i < line.length) {
    // Whitespace
    if (/\s/.test(line[i])) {
      let j = i;
      while (j < line.length && /\s/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: "text" });
      i = j;
      continue;
    }
    // Single-line comment
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ text: line.slice(i), type: "comment" });
      break;
    }
    // Multi-line comment start on single line
    if (line[i] === "/" && line[i + 1] === "*") {
      const end = line.indexOf("*/", i + 2);
      if (end !== -1) {
        tokens.push({ text: line.slice(i, end + 2), type: "comment" });
        i = end + 2;
      } else {
        tokens.push({ text: line.slice(i), type: "comment" });
        break;
      }
      continue;
    }
    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) {
        if (line[j] === "\\") j++;
        j++;
      }
      j = Math.min(j + 1, line.length);
      tokens.push({ text: line.slice(i, j), type: "string" });
      i = j;
      continue;
    }
    // Numbers
    if (/\d/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d.xXa-fA-FeEbBoO_]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: "number" });
      i = j;
      continue;
    }
    // Identifiers
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      // Check if followed by (
      let k = j;
      while (k < line.length && line[k] === " ") k++;
      if (keywords.has(word)) tokens.push({ text: word, type: "keyword" });
      else if (constants.has(word)) tokens.push({ text: word, type: "keyword" });
      else if (builtins.has(word)) tokens.push({ text: word, type: "builtin" });
      else if (line[k] === "(") tokens.push({ text: word, type: "function" });
      else tokens.push({ text: word, type: "text" });
      i = j;
      continue;
    }
    // Operators
    if (/[+\-*/%=!<>&|^~?:]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[+\-*/%=!<>&|^~?:]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: "operator" });
      i = j;
      continue;
    }
    // Arrow
    tokens.push({ text: line[i], type: "text" });
    i++;
  }
  return tokens;
}

function tokenizeHTML(line: string): Token[] {
  const tokens: Token[] = [];
  const re = /(<!--[\s\S]*?-->|<\/?[a-zA-Z][\w-]*|\/?>|[a-zA-Z-]+=|"[^"]*"|'[^']*'|[^<]+)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const t = m[0];
    if (t.startsWith("<!--")) tokens.push({ text: t, type: "comment" });
    else if (t.startsWith("<")) tokens.push({ text: t, type: "tag" });
    else if (t === "/>" || t === ">") tokens.push({ text: t, type: "tag" });
    else if (t.endsWith("=")) tokens.push({ text: t, type: "attribute" });
    else if (t.startsWith('"') || t.startsWith("'")) tokens.push({ text: t, type: "string" });
    else tokens.push({ text: t, type: "text" });
  }
  return tokens;
}

function tokenizeCSS(line: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\/\*[\s\S]*?\*\/|\/\/.*$|"[^"]*"|'[^']*'|[.#]?[a-zA-Z_-][\w-]*(?=\s*[{,:])|:\s*|[{}();,]|#[0-9a-fA-F]{3,8}|\b\d+\.?\d*(px|em|rem|vh|vw|%|s|ms|deg)?\b|[a-zA-Z_-][\w-]*|@[a-zA-Z-]+|\s+|.)/gm;
  let m;
  let inValue = false;
  while ((m = re.exec(line)) !== null) {
    const t = m[0];
    if (t.startsWith("/*") || t.startsWith("//")) { tokens.push({ text: t, type: "comment" }); continue; }
    if (t.startsWith('"') || t.startsWith("'")) { tokens.push({ text: t, type: "string" }); continue; }
    if (t === "{") { inValue = false; tokens.push({ text: t, type: "text" }); continue; }
    if (t === "}") { inValue = false; tokens.push({ text: t, type: "text" }); continue; }
    if (t.startsWith(":")) { inValue = true; tokens.push({ text: t, type: "text" }); continue; }
    if (t === ";") { inValue = false; tokens.push({ text: t, type: "text" }); continue; }
    if (t.startsWith("@")) { tokens.push({ text: t, type: "keyword" }); continue; }
    if (t.startsWith("#") && /^#[0-9a-fA-F]/.test(t)) { tokens.push({ text: t, type: "number" }); continue; }
    if (/^\d/.test(t)) { tokens.push({ text: t, type: "number" }); continue; }
    if (t.startsWith(".") || t.startsWith("#")) { tokens.push({ text: t, type: "selector" }); continue; }
    if (inValue) { tokens.push({ text: t, type: "string" }); continue; }
    if (/^[a-zA-Z]/.test(t)) { tokens.push({ text: t, type: "property" }); continue; }
    tokens.push({ text: t, type: "text" });
  }
  return tokens;
}

function tokenizePython(line: string): Token[] {
  const tokens: Token[] = [];
  const keywords = new Set(["def","class","if","elif","else","for","while","return","import","from","as","with","try","except","finally","raise","pass","break","continue","and","or","not","is","in","lambda","yield","global","nonlocal","assert","del","True","False","None","async","await"]);
  const builtins = new Set(["print","len","range","int","str","float","list","dict","set","tuple","type","isinstance","enumerate","zip","map","filter","sorted","reversed","open","input","super","property","staticmethod","classmethod"]);

  let i = 0;
  while (i < line.length) {
    if (/\s/.test(line[i])) {
      let j = i;
      while (j < line.length && /\s/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: "text" });
      i = j;
      continue;
    }
    if (line[i] === "#") {
      tokens.push({ text: line.slice(i), type: "comment" });
      break;
    }
    if (line[i] === "@") {
      let j = i + 1;
      while (j < line.length && /[\w.]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: "decorator" });
      i = j;
      continue;
    }
    if ((line[i] === '"' || line[i] === "'")) {
      const q = line[i];
      const triple = line.slice(i, i + 3) === q + q + q;
      if (triple) {
        const end = line.indexOf(q + q + q, i + 3);
        if (end !== -1) {
          tokens.push({ text: line.slice(i, end + 3), type: "string" });
          i = end + 3;
        } else {
          tokens.push({ text: line.slice(i), type: "string" });
          break;
        }
      } else {
        let j = i + 1;
        while (j < line.length && line[j] !== q) { if (line[j] === "\\") j++; j++; }
        j = Math.min(j + 1, line.length);
        tokens.push({ text: line.slice(i, j), type: "string" });
        i = j;
      }
      continue;
    }
    if (/\d/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d._xXoObBeE]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: "number" });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /\w/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (keywords.has(word)) tokens.push({ text: word, type: "keyword" });
      else if (builtins.has(word)) tokens.push({ text: word, type: "builtin" });
      else {
        let k = j;
        while (k < line.length && line[k] === " ") k++;
        if (line[k] === "(") tokens.push({ text: word, type: "function" });
        else tokens.push({ text: word, type: "text" });
      }
      i = j;
      continue;
    }
    tokens.push({ text: line[i], type: "text" });
    i++;
  }
  return tokens;
}

function tokenizeJSON(line: string): Token[] {
  const tokens: Token[] = [];
  const re = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|\b(true|false)\b|\b(null)\b|\b(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\b|([{}[\]:,])|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m[1]) tokens.push({ text: m[1], type: "key" });
    else if (m[2]) tokens.push({ text: m[2], type: "string" });
    else if (m[3]) tokens.push({ text: m[3], type: "boolean" });
    else if (m[4]) tokens.push({ text: m[4], type: "null" });
    else if (m[5]) tokens.push({ text: m[5], type: "number" });
    else tokens.push({ text: m[0], type: "text" });
  }
  return tokens;
}

function tokenizeMarkdown(line: string): Token[] {
  if (/^#{1,6}\s/.test(line)) return [{ text: line, type: "heading" }];
  if (/^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
    return [{ text: line, type: "text" }];
  }
  // Inline
  const tokens: Token[] = [];
  const re = /(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*]+\*|_[^_]+_)|(`[^`]+`)|(\[([^\]]+)\]\([^)]+\))|([^*_`[]+|.)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m[1]) tokens.push({ text: m[1], type: "bold" });
    else if (m[2]) tokens.push({ text: m[2], type: "italic" });
    else if (m[3]) tokens.push({ text: m[3], type: "code" });
    else if (m[4]) tokens.push({ text: m[4], type: "link" });
    else tokens.push({ text: m[0], type: "text" });
  }
  return tokens;
}

function tokenizeLine(line: string, language: string): Token[] {
  switch (language) {
    case "javascript":
    case "typescript":
      return tokenizeJSProperly(line);
    case "html":
      return tokenizeHTML(line);
    case "css":
      return tokenizeCSS(line);
    case "python":
      return tokenizePython(line);
    case "json":
      return tokenizeJSON(line);
    case "markdown":
      return tokenizeMarkdown(line);
    default:
      return [{ text: line, type: "text" }];
  }
}

function tokenToColor(token: Token, theme: Theme): string {
  const colorMap: Record<string, string> = {
    keyword: theme.keyword,
    string: theme.string,
    number: theme.number,
    comment: theme.comment,
    function: theme.function,
    tag: theme.tag,
    attribute: theme.attribute,
    operator: theme.operator,
    property: theme.property,
    selector: theme.selector,
    builtin: theme.builtin,
    decorator: theme.decorator,
    heading: theme.heading,
    bold: theme.bold,
    link: theme.link,
    key: theme.key,
    boolean: theme.boolean,
    null: theme.null,
    code: theme.string,
    italic: theme.text,
    text: theme.text,
  };
  return colorMap[token.type] || theme.text;
}

export function highlightLine(line: string, language: string, theme: Theme): string {
  if (!line) return "&nbsp;";
  const tokens = tokenizeLine(line, language);
  return tokens
    .map((t) => {
      const color = tokenToColor(t, theme);
      const escaped = escapeHtml(t.text);
      let style = `color:${color}`;
      if (t.type === "comment") style += ";font-style:italic";
      if (t.type === "heading") style += ";font-weight:bold;font-size:1.1em";
      if (t.type === "bold") style += ";font-weight:bold";
      if (t.type === "italic") style += ";font-style:italic";
      if (t.type === "code") style += `;background:rgba(255,255,255,0.05);padding:1px 4px;border-radius:3px`;
      return `<span style="${style}">${escaped}</span>`;
    })
    .join("");
}

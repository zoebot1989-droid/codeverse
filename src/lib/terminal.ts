export interface TerminalState {
  lines: { text: string; type: "input" | "output" | "error" }[];
  cwd: string;
  history: string[];
  historyIndex: number;
}

export function createTerminal(): TerminalState {
  return {
    lines: [
      { text: "CodeVerse Terminal v1.0.0", type: "output" },
      { text: 'Type "help" for available commands.\n', type: "output" },
    ],
    cwd: "~/demo-project",
    history: [],
    historyIndex: -1,
  };
}

export function executeCommand(
  state: TerminalState,
  input: string,
  files: Record<string, string>
): TerminalState {
  const newState = { ...state, lines: [...state.lines] };
  const prompt = `user@codeverse:${state.cwd}$ `;
  newState.lines.push({ text: prompt + input, type: "input" });
  newState.history = [input, ...state.history.filter((h) => h !== input)];
  newState.historyIndex = -1;

  const parts = input.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    case "":
      break;

    case "help":
      newState.lines.push({
        text: `Available commands:
  ls        List files
  cd        Change directory
  pwd       Print working directory
  cat       Print file contents
  echo      Print text
  clear     Clear terminal
  mkdir     Create directory
  touch     Create file
  rm        Remove file
  node      Run JavaScript (simulated)
  python    Run Python (simulated)
  git       Git commands (simulated)
  whoami    Who are you?
  date      Current date
  help      Show this help`,
        type: "output",
      });
      break;

    case "ls": {
      const prefix = state.cwd === "~/demo-project" ? "demo-project/" : 
        state.cwd.replace("~/", "") + "/";
      const items = new Set<string>();
      for (const path of Object.keys(files)) {
        if (path.startsWith(prefix)) {
          const rest = path.slice(prefix.length);
          const name = rest.split("/")[0];
          items.add(rest.includes("/") ? name + "/" : name);
        }
      }
      if (items.size === 0) {
        newState.lines.push({ text: "(empty)", type: "output" });
      } else {
        newState.lines.push({ text: Array.from(items).sort().join("  "), type: "output" });
      }
      break;
    }

    case "cd":
      if (!args[0] || args[0] === "~") {
        newState.cwd = "~/demo-project";
      } else if (args[0] === "..") {
        const parts = state.cwd.split("/");
        if (parts.length > 1) {
          parts.pop();
          newState.cwd = parts.join("/") || "~";
        }
      } else {
        newState.cwd = state.cwd + "/" + args[0];
      }
      break;

    case "pwd":
      newState.lines.push({ text: state.cwd, type: "output" });
      break;

    case "cat": {
      if (!args[0]) {
        newState.lines.push({ text: "cat: missing operand", type: "error" });
        break;
      }
      const prefix = state.cwd === "~/demo-project" ? "demo-project/" :
        state.cwd.replace("~/", "") + "/";
      const filePath = prefix + args[0];
      if (files[filePath]) {
        newState.lines.push({ text: files[filePath], type: "output" });
      } else {
        newState.lines.push({ text: `cat: ${args[0]}: No such file`, type: "error" });
      }
      break;
    }

    case "echo":
      newState.lines.push({ text: args.join(" "), type: "output" });
      break;

    case "clear":
      newState.lines = [];
      break;

    case "mkdir":
      newState.lines.push({ text: `Created directory: ${args[0] || "(no name)"}`, type: "output" });
      break;

    case "touch":
      newState.lines.push({ text: `Created file: ${args[0] || "(no name)"}`, type: "output" });
      break;

    case "rm":
      if (args.includes("-rf") && args.includes("/")) {
        newState.lines.push({ text: "Nice try. 😏", type: "error" });
      } else {
        newState.lines.push({ text: `Removed: ${args.filter(a => !a.startsWith("-")).join(", ") || "(nothing)"}`, type: "output" });
      }
      break;

    case "node":
      if (!args[0]) {
        newState.lines.push({ text: "Welcome to Node.js v20.10.0.\nType .exit to exit.\n> (Interactive mode not supported in simulation)", type: "output" });
      } else {
        newState.lines.push({ text: `Running ${args[0]}...`, type: "output" });
        newState.lines.push({ text: "✓ Execution complete. No errors.", type: "output" });
      }
      break;

    case "python":
    case "python3":
      if (!args[0]) {
        newState.lines.push({ text: "Python 3.12.0\n>>> (Interactive mode not supported in simulation)", type: "output" });
      } else {
        newState.lines.push({ text: `Running ${args[0]}...`, type: "output" });
        newState.lines.push({ text: "✓ Execution complete.", type: "output" });
      }
      break;

    case "git":
      switch (args[0]) {
        case "status":
          newState.lines.push({
            text: `On branch main
Changes not staged for commit:
  modified:   app.js
  modified:   style.css

Untracked files:
  (none)

no changes added to commit`,
            type: "output",
          });
          break;
        case "add":
          newState.lines.push({ text: `Added: ${args.slice(1).join(", ") || "all files"}`, type: "output" });
          break;
        case "commit":
          newState.lines.push({
            text: `[main a3f7b2c] ${args.includes("-m") ? args[args.indexOf("-m") + 1] || "update" : "update"}
 2 files changed, 42 insertions(+), 7 deletions(-)`,
            type: "output",
          });
          break;
        case "log":
          newState.lines.push({
            text: `commit a3f7b2c (HEAD -> main)
Author: You <you@codeverse.dev>
Date:   ${new Date().toLocaleDateString()}

    Initial commit — built by AI 🤖`,
            type: "output",
          });
          break;
        default:
          newState.lines.push({ text: `git: '${args[0]}' is not a git command`, type: "error" });
      }
      break;

    case "whoami":
      newState.lines.push({ text: "user (powered by AI ✨)", type: "output" });
      break;

    case "date":
      newState.lines.push({ text: new Date().toString(), type: "output" });
      break;

    case "neofetch":
      newState.lines.push({
        text: `   ████████   user@codeverse
   ██    ██   OS: CodeVerse Browser IDE
   ████████   Host: Your Browser
   ██    ██   Kernel: JavaScript
   ████████   Shell: CodeVerse Terminal
              Resolution: ${typeof window !== "undefined" ? window.innerWidth + "x" + window.innerHeight : "?"}
              Theme: Dark+
              Built by: AI 🤖`,
        type: "output",
      });
      break;

    case "sudo":
      newState.lines.push({ text: "sudo: AI doesn't need sudo. We already run everything. 😈", type: "output" });
      break;

    case "exit":
      newState.lines.push({ text: "There is no escape. 🙃", type: "output" });
      break;

    default:
      newState.lines.push({
        text: `command not found: ${cmd}. Try "help"`,
        type: "error",
      });
  }

  return newState;
}

export function getCompletions(partial: string, files: Record<string, string>, cwd: string): string[] {
  const commands = ["ls","cd","pwd","cat","echo","clear","mkdir","touch","rm","node","python","git","help","whoami","date","neofetch","exit"];
  
  if (!partial.includes(" ")) {
    return commands.filter(c => c.startsWith(partial));
  }
  
  const parts = partial.split(/\s+/);
  const last = parts[parts.length - 1];
  const prefix = cwd === "~/demo-project" ? "demo-project/" : cwd.replace("~/", "") + "/";
  
  const names = Object.keys(files)
    .filter(f => f.startsWith(prefix))
    .map(f => f.slice(prefix.length).split("/")[0]);
  
  const unique = [...new Set(names)];
  return unique.filter(n => n.startsWith(last));
}

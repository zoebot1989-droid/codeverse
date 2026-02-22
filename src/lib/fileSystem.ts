import { defaultProject, flattenFiles, FileNode } from "./defaultFiles";

const STORAGE_KEY = "codeverse-files";
const TREE_KEY = "codeverse-tree";

export function loadFiles(): Record<string, string> {
  if (typeof window === "undefined") return flattenFiles(defaultProject);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return flattenFiles(defaultProject);
}

export function saveFiles(files: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

export function loadTree(): FileNode {
  if (typeof window === "undefined") return defaultProject;
  try {
    const saved = localStorage.getItem(TREE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultProject;
}

export function saveTree(tree: FileNode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TREE_KEY, JSON.stringify(tree));
}

export function resetFiles(): { files: Record<string, string>; tree: FileNode } {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TREE_KEY);
  }
  return { files: flattenFiles(defaultProject), tree: defaultProject };
}

export function addFileToTree(tree: FileNode, parentPath: string, name: string, type: "file" | "folder"): FileNode {
  const clone = JSON.parse(JSON.stringify(tree));
  const parts = parentPath.split("/").filter(Boolean);
  let node = clone;
  for (const part of parts.slice(1)) { // skip root
    node = node.children?.find((c: FileNode) => c.name === part) || node;
  }
  if (!node.children) node.children = [];
  node.children.push({ name, type, ...(type === "file" ? { content: "" } : { children: [] }) });
  return clone;
}

export function deleteFromTree(tree: FileNode, path: string): FileNode {
  const clone = JSON.parse(JSON.stringify(tree));
  const parts = path.split("/").filter(Boolean);
  const targetName = parts[parts.length - 1];
  let node = clone;
  for (const part of parts.slice(1, -1)) {
    node = node.children?.find((c: FileNode) => c.name === part) || node;
  }
  if (node.children) {
    node.children = node.children.filter((c: FileNode) => c.name !== targetName);
  }
  return clone;
}

export function renameInTree(tree: FileNode, path: string, newName: string): FileNode {
  const clone = JSON.parse(JSON.stringify(tree));
  const parts = path.split("/").filter(Boolean);
  const targetName = parts[parts.length - 1];
  let node = clone;
  for (const part of parts.slice(1, -1)) {
    node = node.children?.find((c: FileNode) => c.name === part) || node;
  }
  const target = node.children?.find((c: FileNode) => c.name === targetName);
  if (target) target.name = newName;
  return clone;
}

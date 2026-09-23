#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JS_ROOT = path.join(ROOT, "js");
const IGNORED_DIRS = new Set(["node_modules", ".git"]);

function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(IGNORED_DIRS.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files=walk(ROOT);
const jsFiles=new Set(files.filter(f=>/\.(js|mjs)$/.test(f)));
const htmlFiles=files.filter(f=>f.endsWith(".html"));

function normalize(p){return path.normalize(p).replaceAll(path.sep,"/");}

function resolveImport(from,specifier){
  if(!specifier || !specifier.startsWith(".")) return null;
  const base=path.resolve(path.dirname(from),specifier);
  const candidates=[
    base,
    base+".js",
    base+".mjs",
    path.join(base,"index.js"),
    path.join(base,"index.mjs")
  ];
  for(const candidate of candidates){
    if(jsFiles.has(candidate)) return candidate;
  }
  return null;
}

const edges=new Map();
for(const file of jsFiles){
  const source=fs.readFileSync(file,"utf8");
  const imports=[];
  const re=/(?:import|export)\s*(?:[^"'()]*?\sfrom\s*)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  while((match=re.exec(source))){
    const specifier=match[1]||match[2];
    const resolved=resolveImport(file,specifier);
    if(resolved) imports.push(resolved);
  }
  edges.set(file,new Set(imports));
}

for(const html of htmlFiles){
  const source=fs.readFileSync(html,"utf8");
  const imports=[];
  const srcRe=/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while((match=srcRe.exec(source))){
    const resolved=resolveImport(html,match[1]);
    if(resolved) imports.push(resolved);
  }
  const inlineImports=source.matchAll(/(?:import|export)\s*(?:[^"'()]*?\sfrom\s*)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g);
  for(const m of inlineImports){
    const resolved=resolveImport(html,m[1]||m[2]);
    if(resolved) imports.push(resolved);
  }
  edges.set(html,new Set(imports));
}

const entrypoints=new Set();
for(const html of htmlFiles) entrypoints.add(html);
for(const file of files){
  if(file.startsWith(path.join(ROOT,"api")+path.sep) ||
     file.startsWith(path.join(ROOT,"server")+path.sep) ||
     file.startsWith(path.join(ROOT,"tests")+path.sep)){
    if(jsFiles.has(file)) entrypoints.add(file);
  }
}

const reachable=new Set();
const stack=[...entrypoints];
while(stack.length){
  const current=stack.pop();
  if(reachable.has(current)) continue;
  reachable.add(current);
  for(const dep of edges.get(current)||[]) stack.push(dep);
}

const candidates=[...jsFiles]
  .filter(file=>file.startsWith(JS_ROOT+path.sep))
  .filter(file=>!reachable.has(file))
  .map(normalize)
  .sort();

const report={scannedJavaScript:jsFiles.size,htmlEntrypoints:htmlFiles.length,entrypoints:[...entrypoints].map(normalize).sort(),deadCodeCandidates:candidates};
fs.writeFileSync(path.join(ROOT,"dead-code-report.json"),JSON.stringify(report,null,2)+"\\n");
console.log(JSON.stringify(report,null,2));

if(candidates.length) process.exitCode=2;

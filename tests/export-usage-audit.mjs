import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXCLUDED = new Set([".git","node_modules",".next","dist","build"]);

function walk(dir, out = []){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(EXCLUDED.has(entry.name)) continue;
    const full = path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full,out);
    else if(/\.(?:js|mjs|html)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function read(file){
  return fs.readFileSync(file,"utf8");
}

const files = walk(ROOT);
const sources = new Map(files.map(file => [file,read(file)]));
const jsFiles = files.filter(file => /\.(?:js|mjs)$/.test(file));

const exported = [];
for(const file of jsFiles){
  const source = sources.get(file);
  for(const match of source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)){
    exported.push({file,name:match[1],kind:"function"});
  }
  for(const match of source.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)){
    exported.push({file,name:match[1],kind:"binding"});
  }
}

const candidates = [];
const internalExports = [];
for(const item of exported){
  const definingSource = sources.get(item.file);
  const escaped = item.name.replace(/[^A-Za-z0-9_$]/g,"\\const candidates = [];
for(const item of exported){
  const otherFiles = files.filter(file => file !== item.file);
  let references = 0;
  for(const file of otherFiles){
    const source = sources.get(file);
    const escaped = item.name.replace(/[^A-Za-z0-9_$]/g,"\\$&");
    const re = new RegExp("\\b"+escaped+"\\b","g");
    references += source.match(re)?.length || 0;
  }
  if(references === 0){
    candidates.push({
      file:path.relative(ROOT,item.file),
      name:item.name,
      kind:item.kind,
      reason:"exported symbol has no textual references outside its defining file"
    });
  }
}");
  const re = new RegExp("\\b"+escaped+"\\b","g");
  const localMatches = definingSource.match(re)?.length || 0;

  let externalReferences = 0;
  for(const file of files){
    if(file === item.file) continue;
    externalReferences += sources.get(file).match(re)?.length || 0;
  }

  // The declaration itself accounts for one local occurrence.
  const internalReferences = Math.max(0, localMatches - 1);

  if(externalReferences === 0 && internalReferences > 0){
    internalExports.push({
      file:path.relative(ROOT,item.file),
      name:item.name,
      kind:item.kind,
      reason:"exported symbol is only used inside its defining file"
    });
  }

  if(externalReferences === 0 && internalReferences === 0){
    candidates.push({
      file:path.relative(ROOT,item.file),
      name:item.name,
      kind:item.kind,
      reason:"exported symbol has no references outside or inside its defining file"
    });
  }
}

const report = {
  generatedAt:new Date().toISOString(),
  scannedFiles:files.length,
  scannedJavaScript:jsFiles.length,
  exportedSymbols:exported.length,
  internalExports,
  candidates
};

fs.writeFileSync(
  path.join(ROOT,"export-usage-report.json"),
  JSON.stringify(report,null,2)+"\n"
);

console.log(JSON.stringify(report,null,2));
if(candidates.length){
  process.exitCode = 2;
}

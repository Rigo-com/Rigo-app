function createFileId(){
  if(typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"){
    return "file_" + crypto.randomUUID();
  }
  return "file_" + Date.now() + "_" + Math.random().toString(36).slice(2,10);
}

function sanitizeFileName(filename){
  const raw = String(filename ?? "")
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if(!raw || raw === "." || raw === "..") return "";

  return raw.slice(0, 255);
}

function validateFileId(fileId){
  return typeof fileId === "string" && /^file_[A-Za-z0-9-]{8,128}$/.test(fileId.trim());
}

function getFileExtension(filename){
  if(typeof filename !== "string") return "";
  const normalizedName = filename.trim().toLowerCase();
  const lastDotIndex = normalizedName.lastIndexOf(".");
  if(lastDotIndex <= 0 || lastDotIndex === normalizedName.length - 1) return "";
  return normalizedName.slice(lastDotIndex);
}

function createFileFingerprint(file){
  return [
    sanitizeFileName(file?.name),
    Number(file?.size) || 0,
    String(file?.type || "").toLowerCase(),
    Number(file?.lastModified) || 0,
    String(file?.webkitRelativePath || "")
  ].join("|");
}

function formatFileSize(bytes){
  const safeBytes = Number(bytes);
  if(!Number.isFinite(safeBytes) || safeBytes < 0) return "0 B";
  if(safeBytes < 1024) return Math.round(safeBytes) + " B";
  const units = ["KB","MB","GB"];
  let value = safeBytes / 1024;
  let unitIndex = 0;
  while(value >= 1024 && unitIndex < units.length - 1){
    value /= 1024;
    unitIndex++;
  }
  return value.toFixed(1) + " " + units[unitIndex];
}

export {
  createFileId,
  sanitizeFileName,
  validateFileId,
  getFileExtension,
  createFileFingerprint,
  formatFileSize
};

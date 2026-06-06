// =====================================
// RIGO AI
// FORMATTER
// =====================================

function formatBytes(
  bytes = 0
){

  if(bytes < 1024){
    return `${bytes} B`;
  }

  if(bytes < 1048576){
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  if(bytes < 1073741824){
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  return `${(bytes / 1073741824).toFixed(2)} GB`;

}



function formatDuration(
  ms = 0
){

  return `${ms} ms`;

}



export const Formatter =
Object.freeze({

  bytes:
  formatBytes,

  duration:
  formatDuration

});

export default
Formatter;

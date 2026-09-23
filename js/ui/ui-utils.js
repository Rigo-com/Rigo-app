// =====================================
// RIGO AI
// UI UTILITIES
// =====================================

function isMobileDevice(){
  if(typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

const UiUtils = Object.freeze({
  isMobileDevice
});

export {
  isMobileDevice,
  UiUtils
};

export default UiUtils;

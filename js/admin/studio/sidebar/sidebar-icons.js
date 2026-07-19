// =====================================
// RIGO AI
// STUDIO SIDEBAR ICONS
// =====================================

function icon(
  body,
  viewBox = "0 0 24 24"
){

  return `
  <svg
    class="rigo-sidebar-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="${viewBox}"
    fill="none"
    aria-hidden="true"
  >
    ${body}
  </svg>
  `;

}



// =====================================
// ICONS
// =====================================

const SidebarIcons =
Object.freeze({

  dashboard:
  icon(`

    <path
      fill="#28C76F"
      d="M12 3l8 7v10a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2V10l8-7z"
    />

    <path
      fill="#A8F0C4"
      d="M12 6.2l5.2 4.5V12H6.8v-1.3L12 6.2z"
    />

  `),

  project:
  icon(`

    <path
      fill="#FDBA2D"
      d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2V7z"
    />

    <path
      fill="#FFE082"
      d="M5 6h5l1.5 1.5H20v2H4V7a1 1 0 0 1 1-1z"
    />

  `),

  system:
  icon(`

    <rect
      x="3"
      y="4"
      width="18"
      height="13"
      rx="2"
      fill="#3B82F6"
    />

    <rect
      x="6"
      y="7"
      width="12"
      height="7"
      rx="1"
      fill="#CFE4FF"
    />

    <rect
      x="9"
      y="19"
      width="6"
      height="2"
      rx="1"
      fill="#3B82F6"
    />

  `),

  agents:
  icon(`

    <circle
      cx="12"
      cy="9"
      r="4"
      fill="#EC4899"
    />

    <rect
      x="7"
      y="13"
      width="10"
      height="7"
      rx="2"
      fill="#F8A5C8"
    />

    <circle
      cx="10"
      cy="9"
      r="0.8"
      fill="#fff"
    />

    <circle
      cx="14"
      cy="9"
      r="0.8"
      fill="#fff"
    />

  `),

  architecture:
  icon(`

    <path
      fill="#00C48C"
      d="M7 4h10v4H7zM4 10h6v4H4zm10 0h6v4h-6zM7 16h10v4H7z"
    />

    <path
      stroke="#fff"
      stroke-width="1.5"
      d="M12 8v8M10 12H7M17 12h-3"
    />

  `),

  memory:
  icon(`

    <path
      fill="#8B5CF6"
      d="M12 3c4.8 0 8.5 3.6 8.5 8.3S16.8 21 12 21 3.5 16.2 3.5 11.3 7.2 3 12 3z"
    />

    <path
      fill="#D7C4FF"
      d="M8 9h8v2H8zm0 4h5v2H8z"
    />

  `),

  debug:
  icon(`

    <path
      fill="#EF4444"
      d="M9 3h6l1 2h3v2h-2v3l2 2v2h-2v5H7v-5H5v-2l2-2V7H5V5h3l1-2z"
    />

    <circle
      cx="10"
      cy="11"
      r="1"
      fill="#fff"
    />

    <circle
      cx="14"
      cy="11"
      r="1"
      fill="#fff"
    />

  `),

  extensions:
  icon(`

    <path
      fill="#10B981"
      d="M12 3l3 3-3 3-3-3 3-3zm6 9l3 3-3 3-3-3 3-3zm-6 6l3 3-3 3-3-3 3-3zM6 12l3 3-3 3-3-3 3-3z"
    />

  `),

  settings:
  icon(`

    <path
      fill="#6B7280"
      d="M12 2l2 2 3-.5.8 2.8 2.7 1.5-1 2.8 1 2.8-2.7 1.5-.8 2.8-3-.5-2 2-2-2-3 .5-.8-2.8-2.7-1.5 1-2.8-1-2.8 2.7-1.5.8-2.8 3 .5 2-2z"
    />

    <circle
      cx="12"
      cy="12"
      r="3"
      fill="#fff"
    />

  `)

});



// =====================================
// EXPORTS
// =====================================

export default SidebarIcons;

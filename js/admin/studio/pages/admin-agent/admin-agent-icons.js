// =====================================
// RIGO AI
// ADMIN AGENT
// ICONS
// =====================================

function icon(
  body
){

  return `
    <svg
      class="rigo-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      ${body}
    </svg>
  `;

}



// =====================================
// ICONS
// =====================================

const AdminAgentIcons =
Object.freeze({

  admin:
  icon(`

    <rect
      x="5"
      y="7"
      width="14"
      height="10"
      rx="2"
    />

    <circle
      cx="9"
      cy="12"
      r="1"
    />

    <circle
      cx="15"
      cy="12"
      r="1"
    />

    <path
      d="M9 15h6"
    />

    <path
      d="M12 3v4"
    />

    <circle
      cx="12"
      cy="3"
      r="1"
      fill="currentColor"
      stroke="none"
    />

  `),

  shield:
  icon(`

    <path
      d="M12 3
         L19 6
         V11
         C19 16
         16 19
         12 21
         C8 19
         5 16
         5 11
         V6
         Z"
    />

    <path
      d="M9.5 12
         L11.5 14
         L15 10"
    />

  `),

  search:
  icon(`

    <circle
      cx="11"
      cy="11"
      r="6"
    />

    <path
      d="M16 16
         L20 20"
    />

  `),

  snapshot:
  icon(`

    <rect
      x="4"
      y="6"
      width="16"
      height="12"
      rx="2"
    />

    <path
      d="M8 6
         L9.5 4
         H14.5
         L16 6"
    />

    <circle
      cx="12"
      cy="12"
      r="3"
    />

  `),

  file:
  icon(`

    <path
      d="M7 3
         H14
         L18 7
         V21
         H7
         Z"
    />

    <path
      d="M14 3
         V7
         H18"
    />

  `),

  folder:
  icon(`

    <path
      d="M3 7
         H9
         L11 9
         H21
         V19
         H3
         Z"
    />

  `),

  system:
  icon(`

    <rect
      x="7"
      y="7"
      width="10"
      height="10"
      rx="2"
    />

    <path d="M12 2v3"/>
    <path d="M12 19v3"/>
    <path d="M2 12h3"/>
    <path d="M19 12h3"/>

  `),

  code:
  icon(`

    <path
      d="M8 8
         L4 12
         L8 16"
    />

    <path
      d="M16 8
         L20 12
         L16 16"
    />

    <path
      d="M14 4
         L10 20"
    />

  `),

  terminal:
  icon(`

    <path
      d="M5 7
         L10 12
         L5 17"
    />

    <path
      d="M12 17
         H19"
    />

  `),

  user:
  icon(`

    <circle
      cx="12"
      cy="8"
      r="4"
    />

    <path
      d="M5
         20
         C6
         16
         8.5
         14
         12
         14
         C15.5
         14
         18
         16
         19
         20"
    />

  `),

  send:
  icon(`

    <path
      d="M3 12
         L21 3
         L13 21
         L10 14
         Z"
    />

    <path
      d="M10 14
         L21 3"
    />

  `)

});



// =====================================
// EXPORTS
// =====================================

export default
AdminAgentIcons;

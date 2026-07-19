// =====================================
// RIGO AI
// STUDIO ADMIN AGENT LAYOUT
// =====================================



// =====================================
// STYLE STATE
// =====================================

const ADMIN_AGENT_STYLE_ID =
"rigo-admin-agent-layout-styles";



// =====================================
// SVG ICONS
// =====================================

const ICONS =
Object.freeze({

  admin:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="7"
        width="14"
        height="11"
        rx="3"
      />

      <path
        d="M12 4v3"
      />

      <circle
        cx="12"
        cy="3.5"
        r="1"
      />

      <circle
        cx="9.5"
        cy="12"
        r="1"
      />

      <circle
        cx="14.5"
        cy="12"
        r="1"
      />

      <path
        d="M9 15h6"
      />

      <path
        d="M3 10v5"
      />

      <path
        d="M21 10v5"
      />
    </svg>
  `,

  shield:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 3l7 3v5c0 4.8-2.8 8.1-7 10-4.2-1.9-7-5.2-7-10V6l7-3z"
      />

      <path
        d="M9 12l2 2 4-4"
      />
    </svg>
  `,

  search:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6"
      />

      <path
        d="M16 16l4 4"
      />
    </svg>
  `,

  snapshot:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="6"
        width="18"
        height="14"
        rx="3"
      />

      <path
        d="M8 6l1.5-2h5L16 6"
      />

      <circle
        cx="12"
        cy="13"
        r="4"
      />
    </svg>
  `,

  file:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6 3h8l4 4v14H6z"
      />

      <path
        d="M14 3v5h5"
      />

      <path
        d="M9 13h6"
      />

      <path
        d="M9 17h4"
      />
    </svg>
  `,

  folder:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 7h7l2 2h9v10H3z"
      />

      <path
        d="M3 7V5h7l2 2"
      />
    </svg>
  `,

  system:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="2"
      />

      <path
        d="M9 2v3"
      />

      <path
        d="M15 2v3"
      />

      <path
        d="M9 19v3"
      />

      <path
        d="M15 19v3"
      />

      <path
        d="M2 9h3"
      />

      <path
        d="M2 15h3"
      />

      <path
        d="M19 9h3"
      />

      <path
        d="M19 15h3"
      />
    </svg>
  `,

  code:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M8 8l-4 4 4 4"
      />

      <path
        d="M16 8l4 4-4 4"
      />

      <path
        d="M14 5l-4 14"
      />
    </svg>
  `,

  send:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 11.5L21 3l-8.5 18-2-7.5L3 11.5z"
      />

      <path
        d="M10.5 13.5L21 3"
      />
    </svg>
  `,

  terminal:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M5 7l4 5-4 5"
      />

      <path
        d="M11 17h8"
      />
    </svg>
  `,

  user:
  `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path
        d="M4 21c1-5 4-7 8-7s7 2 8 7"
      />
    </svg>
  `

});



// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(
  value
){

  return String(
    value ?? ""
  )
  .replaceAll(
    "&",
    "&amp;"
  )
  .replaceAll(
    "<",
    "&lt;"
  )
  .replaceAll(
    ">",
    "&gt;"
  )
  .replaceAll(
    '"',
    "&quot;"
  )
  .replaceAll(
    "'",
    "&#039;"
  );

}



// =====================================
// FORMAT OUTPUT
// =====================================

function formatOutput(
  value
){

  if(
    typeof value ===
    "string"
  ){

    return escapeHTML(
      value
    );

  }

  try{

    return escapeHTML(
      JSON.stringify(
        value,
        null,
        2
      )
    );

  }
  catch(error){

    return escapeHTML(
      String(
        value
      )
    );

  }

}



// =====================================
// FORMAT TIME
// =====================================

function formatTime(
  value
){

  const timestamp =
  value
  ? new Date(
      value
    )
  : new Date();

  if(
    Number.isNaN(
      timestamp.getTime()
    )
  ){

    return "";

  }

  return timestamp
  .toLocaleTimeString(
    [],
    {

      hour:
      "2-digit",

      minute:
      "2-digit"

    }
  );

}



// =====================================
// NORMALIZE ROLE
// =====================================

function normalizeRole(
  role
){

  const value =
  String(
    role || "assistant"
  )
  .toLowerCase();

  if(
    value === "user"
  ){

    return "user";

  }

  if(
    value === "system"
  ){

    return "system";

  }

  if(
    value === "error"
  ){

    return "error";

  }

  return "assistant";

}



// =====================================
// MOUNT STYLES
// =====================================

function mountStyles(){

  if(
    document.getElementById(
      ADMIN_AGENT_STYLE_ID
    )
  ){

    return true;

  }

  const style =
  document.createElement(
    "style"
  );

  style.id =
  ADMIN_AGENT_STYLE_ID;

  style.textContent = `

/* =====================================
   ADMIN AGENT ROOT
===================================== */

.rigo-admin-agent-page{

  --admin-bg:
  #020816;

  --admin-surface:
  rgba(7,18,34,.86);

  --admin-surface-strong:
  rgba(9,22,40,.96);

  --admin-border:
  rgba(118,160,205,.17);

  --admin-border-strong:
  rgba(83,225,180,.3);

  --admin-text:
  #f5f9ff;

  --admin-text-soft:
  #9aa9bf;

  --admin-text-muted:
  #65758e;

  --admin-green:
  #15e6a0;

  --admin-green-dark:
  #079f70;

  --admin-blue:
  #18bffc;

  --admin-yellow:
  #ffc928;

  --admin-purple:
  #b24cff;

  --admin-danger:
  #ff4c72;

  position:relative;

  width:100%;

  min-width:0;

  min-height:calc(100vh - 118px);

  display:flex;

  flex-direction:column;

  box-sizing:border-box;

  overflow:hidden;

  color:var(--admin-text);

  padding:28px;

  border:1px solid
  var(--admin-border);

  border-radius:24px;

  background:

    radial-gradient(
      circle at 78% 16%,
      rgba(19,103,148,.13),
      transparent 32%
    ),

    radial-gradient(
      circle at 26% 98%,
      rgba(14,228,159,.06),
      transparent 35%
    ),

    linear-gradient(
      145deg,
      rgba(4,13,26,.98),
      rgba(2,8,20,.99)
    );

  box-shadow:

    inset 0 1px 0
    rgba(255,255,255,.02),

    0 24px 60px
    rgba(0,0,0,.32);

  isolation:isolate;

}



/* =====================================
   DECORATION
===================================== */

.rigo-admin-agent-page::before{

  content:"";

  position:absolute;

  inset:0;

  z-index:-1;

  opacity:.16;

  pointer-events:none;

  background-image:

    linear-gradient(
      rgba(255,255,255,.018) 1px,
      transparent 1px
    ),

    linear-gradient(
      90deg,
      rgba(255,255,255,.018) 1px,
      transparent 1px
    );

  background-size:
  38px 38px;

  mask-image:

    linear-gradient(
      to bottom,
      transparent,
      black 25%,
      black 70%,
      transparent
    );

}



.rigo-admin-agent-page::after{

  content:"";

  position:absolute;

  right:-140px;

  top:110px;

  width:420px;

  height:420px;

  z-index:-1;

  pointer-events:none;

  border-radius:50%;

  background:

    radial-gradient(
      circle,
      rgba(20,229,162,.085),
      transparent 66%
    );

  filter:blur(4px);

}



/* =====================================
   HEADER
===================================== */

.rigo-admin-agent-header{

  display:flex;

  align-items:flex-start;

  justify-content:space-between;

  gap:24px;

  margin-bottom:26px;

}



.rigo-admin-agent-identity{

  min-width:0;

  display:flex;

  align-items:center;

  gap:18px;

}



.rigo-admin-agent-avatar{

  flex:0 0 auto;

  width:86px;

  height:86px;

  display:grid;

  place-items:center;

  color:var(--admin-green);

  border-radius:24px;

  border:1px solid
  rgba(55,225,173,.22);

  background:

    radial-gradient(
      circle at 50% 36%,
      rgba(19,231,163,.22),
      transparent 56%
    ),

    linear-gradient(
      145deg,
      rgba(12,35,52,.96),
      rgba(4,18,31,.96)
    );

  box-shadow:

    inset 0 1px 0
    rgba(255,255,255,.04),

    0 16px 40px
    rgba(0,0,0,.28),

    0 0 32px
    rgba(16,220,154,.08);

}



.rigo-admin-agent-avatar svg{

  width:47px;

  height:47px;

  fill:none;

  stroke:currentColor;

  stroke-width:1.8;

  stroke-linecap:round;

  stroke-linejoin:round;

  filter:

    drop-shadow(
      0 0 9px
      rgba(21,230,160,.42)
    );

}



.rigo-admin-agent-heading{

  min-width:0;

}



.rigo-admin-agent-title-line{

  display:flex;

  align-items:center;

  gap:12px;

  min-width:0;

}



.rigo-admin-agent-title-line h1{

  margin:0;

  color:#ffffff;

  font-family:

    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  font-size:
  clamp(
    30px,
    3vw,
    46px
  );

  font-weight:750;

  line-height:1.08;

  letter-spacing:-1.35px;

}



.rigo-admin-agent-shield{

  width:29px;

  height:29px;

  display:grid;

  place-items:center;

  color:var(--admin-green);

}



.rigo-admin-agent-shield svg{

  width:100%;

  height:100%;

  fill:
  rgba(14,229,159,.1);

  stroke:currentColor;

  stroke-width:1.8;

  stroke-linecap:round;

  stroke-linejoin:round;

}



.rigo-admin-agent-description{

  margin:10px 0 0;

  color:var(--admin-text-soft);

  font-size:16px;

  line-height:1.55;

}



.rigo-admin-agent-status{

  width:max-content;

  display:inline-flex;

  align-items:center;

  gap:9px;

  margin-top:12px;

  color:var(--admin-text-muted);

  font-size:14px;

  font-weight:700;

  letter-spacing:.3px;

}



.rigo-admin-agent-status::before{

  content:"";

  width:10px;

  height:10px;

  flex:0 0 auto;

  border-radius:50%;

  background:#6f7c8e;

  box-shadow:
  0 0 0 5px
  rgba(111,124,142,.07);

}



.rigo-admin-agent-status[data-available="true"]{

  color:var(--admin-green);

}



.rigo-admin-agent-status[data-available="true"]::before{

  background:var(--admin-green);

  box-shadow:

    0 0 0 5px
    rgba(21,230,160,.08),

    0 0 16px
    rgba(21,230,160,.65);

}



.rigo-admin-agent-status[data-status="error"],
.rigo-admin-agent-status[data-status="missing"]{

  color:var(--admin-danger);

}



.rigo-admin-agent-status[data-status="error"]::before,
.rigo-admin-agent-status[data-status="missing"]::before{

  background:var(--admin-danger);

  box-shadow:

    0 0 0 5px
    rgba(255,76,114,.08),

    0 0 16px
    rgba(255,76,114,.48);

}



/* =====================================
   HEADER BADGE
===================================== */

.rigo-admin-agent-access{

  flex:0 0 auto;

  display:flex;

  align-items:center;

  gap:11px;

  padding:12px 15px;

  color:#c4d2e5;

  font-size:13px;

  font-weight:650;

  border:1px solid
  var(--admin-border);

  border-radius:14px;

  background:
  rgba(7,18,32,.7);

  box-shadow:
  inset 0 1px 0
  rgba(255,255,255,.025);

}



.rigo-admin-agent-access-icon{

  width:21px;

  height:21px;

  display:grid;

  place-items:center;

  color:var(--admin-green);

}



.rigo-admin-agent-access-icon svg{

  width:100%;

  height:100%;

  fill:none;

  stroke:currentColor;

  stroke-width:1.8;

  stroke-linecap:round;

  stroke-linejoin:round;

}



/* =====================================
   QUICK ACTIONS
===================================== */

.rigo-admin-agent-quick-actions{

  width:100%;

  display:grid;

  grid-template-columns:

    repeat(
      6,
      minmax(150px,1fr)
    );

  gap:12px;

  margin-bottom:20px;

}



.rigo-admin-agent-action{

  position:relative;

  min-width:0;

  height:58px;

  display:flex;

  align-items:center;

  justify-content:flex-start;

  gap:11px;

  padding:0 16px;

  overflow:hidden;

  color:#dfe8f4;

  font-family:inherit;

  font-size:14px;

  font-weight:650;

  white-space:nowrap;

  cursor:pointer;

  border:1px solid
  var(--admin-border);

  border-radius:14px;

  background:

    linear-gradient(
      145deg,
      rgba(10,25,43,.93),
      rgba(5,15,29,.92)
    );

  box-shadow:
  inset 0 1px 0
  rgba(255,255,255,.025);

  transition:

    transform .18s ease,
    border-color .18s ease,
    background .18s ease,
    box-shadow .18s ease,
    color .18s ease;

}



.rigo-admin-agent-action::before{

  content:"";

  position:absolute;

  inset:auto -22px -42px auto;

  width:90px;

  height:90px;

  border-radius:50%;

  opacity:0;

  background:
  currentColor;

  filter:blur(44px);

  transition:
  opacity .18s ease;

}



.rigo-admin-agent-action:hover{

  transform:
  translateY(-2px);

  color:#ffffff;

  border-color:
  rgba(43,229,172,.28);

  background:

    linear-gradient(
      145deg,
      rgba(11,34,50,.98),
      rgba(6,20,34,.96)
    );

  box-shadow:

    inset 0 1px 0
    rgba(255,255,255,.035),

    0 12px 26px
    rgba(0,0,0,.22);

}



.rigo-admin-agent-action:hover::before{

  opacity:.08;

}



.rigo-admin-agent-action:active{

  transform:
  translateY(0);

}



.rigo-admin-agent-action:disabled{

  opacity:.48;

  cursor:not-allowed;

  transform:none;

}



.rigo-admin-agent-action-icon{

  width:23px;

  height:23px;

  flex:0 0 auto;

  display:grid;

  place-items:center;

}



.rigo-admin-agent-action-icon svg{

  width:100%;

  height:100%;

  fill:none;

  stroke:currentColor;

  stroke-width:1.9;

  stroke-linecap:round;

  stroke-linejoin:round;

}



.rigo-admin-agent-action.scan{

  color:var(--admin-green);

}



.rigo-admin-agent-action.snapshot{

  color:#1be0a3;

}



.rigo-admin-agent-action.files{

  color:var(--admin-blue);

}



.rigo-admin-agent-action.folders{

  color:var(--admin-yellow);

}



.rigo-admin-agent-action.systems{

  color:#5ed5bf;

}



.rigo-admin-agent-action.analyze{

  color:var(--admin-purple);

}



.rigo-admin-agent-action-label{

  color:#e9f0f8;

  overflow:hidden;

  text-overflow:ellipsis;

}



/* =====================================
   CONSOLE
===================================== */

.rigo-admin-agent-console{

  position:relative;

  min-height:330px;

  flex:1 1 auto;

  display:flex;

  flex-direction:column;

  gap:13px;

  padding:22px;

  overflow:auto;

  overscroll-behavior:contain;

  scrollbar-width:thin;

  scrollbar-color:

    rgba(114,151,192,.3)
    transparent;

  border:1px solid
  var(--admin-border);

  border-radius:20px;

  background:

    radial-gradient(
      circle at 92% 45%,
      rgba(20,223,163,.035),
      transparent 28%
    ),

    linear-gradient(
      145deg,
      rgba(4,14,28,.92),
      rgba(2,9,21,.95)
    );

  box-shadow:

    inset 0 1px 0
    rgba(255,255,255,.018),

    inset 0 -30px 90px
    rgba(0,0,0,.1);

}



.rigo-admin-agent-console::-webkit-scrollbar{

  width:8px;

}



.rigo-admin-agent-console::-webkit-scrollbar-track{

  background:transparent;

}



.rigo-admin-agent-console::-webkit-scrollbar-thumb{

  border-radius:999px;

  background:
  rgba(112,148,190,.25);

}



/* =====================================
   EMPTY STATE
===================================== */

.rigo-admin-agent-empty{

  min-height:140px;

  display:flex;

  align-items:flex-start;

  gap:15px;

}



.rigo-admin-agent-empty-avatar{

  width:50px;

  height:50px;

  flex:0 0 auto;

  display:grid;

  place-items:center;

  color:var(--admin-green);

  border-radius:16px;

  background:

    linear-gradient(
      145deg,
      rgba(14,100,80,.42),
      rgba(7,45,48,.45)
    );

  border:1px solid
  rgba(44,222,170,.13);

  box-shadow:
  0 0 28px
  rgba(21,230,160,.07);

}



.rigo-admin-agent-empty-avatar svg{

  width:29px;

  height:29px;

  fill:none;

  stroke:currentColor;

  stroke-width:1.85;

  stroke-linecap:round;

  stroke-linejoin:round;

}



.rigo-admin-agent-empty-content{

  min-width:0;

  padding-top:2px;

}



.rigo-admin-agent-empty-heading{

  display:flex;

  align-items:center;

  flex-wrap:wrap;

  gap:10px;

  margin-bottom:8px;

}



.rigo-admin-agent-empty-name{

  color:#f5f9ff;

  font-size:15px;

  font-weight:700;

}



.rigo-admin-agent-empty-time{

  color:var(--admin-text-muted);

  font-size:13px;

}



.rigo-admin-agent-empty-message{

  color:#dfe8f3;

  font-size:15px;

  line-height:1.55;

}



.rigo-admin-agent-empty-subtitle{

  margin-top:9px;

  color:#74839a;

  font-size:14px;

}



/* =====================================
   MESSAGES
===================================== */

.rigo-admin-agent-message{

  width:min(860px,88%);

  display:flex;

  align-items:flex-start;

  gap:13px;

  animation:
  rigoAdminMessageIn
  .24s ease both;

}



.rigo-admin-agent-message.user{

  margin-left:auto;

  flex-direction:row-reverse;

}



.rigo-admin-agent-message-icon{

  width:39px;

  height:39px;

  flex:0 0 auto;

  display:grid;

  place-items:center;

  border-radius:13px;

  color:var(--admin-green);

  background:
  rgba(13,93,72,.34);

  border:1px solid
  rgba(38,220,164,.12);

}



.rigo-admin-agent-message.user
.rigo-admin-agent-message-icon{

  color:#54c8ff;

  background:
  rgba(22,94,132,.3);

  border-color:
  rgba(63,183,241,.13);

}



.rigo-admin-agent-message.error
.rigo-admin-agent-message-icon{

  color:var(--admin-danger);

  background:
  rgba(118,25,51,.3);

  border-color:
  rgba(255,76,114,.14);

}



.rigo-admin-agent-message-icon svg{

  width:23px;

  height:23px;

  fill:none;

  stroke:currentColor;

  stroke-width:1.9;

  stroke-linecap:round;

  stroke-linejoin:round;

}



.rigo-admin-agent-message-main{

  min-width:0;

  flex:1;

}



.rigo-admin-agent-message-header{

  display:flex;

  align-items:center;

  flex-wrap:wrap;

  gap:9px;

  margin-bottom:7px;

}



.rigo-admin-agent-message.user
.rigo-admin-agent-message-header{

  justify-content:flex-end;

}



.rigo-admin-agent-role{

  color:#eef5fd;

  font-size:13px;

  font-weight:720;

  text-transform:capitalize;

}



.rigo-admin-agent-message-time{

  color:#63738b;

  font-size:12px;

}



.rigo-admin-agent-message pre{

  width:100%;

  margin:0;

  padding:13px 15px;

  box-sizing:border-box;

  overflow:auto;

  white-space:pre-wrap;

  overflow-wrap:anywhere;

  color:#cfd9e8;

  font-family:

    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;

  font-size:13px;

  line-height:1.65;

  border:1px solid
  rgba(110,147,188,.12);

  border-radius:13px;

  background:
  rgba(8,20,35,.72);

}



.rigo-admin-agent-message.user pre{

  color:#e3f5ff;

  border-color:
  rgba(40,165,225,.13);

  background:
  rgba(9,40,58,.66);

}



.rigo-admin-agent-message.error pre{

  color:#ffd5df;

  border-color:
  rgba(255,76,114,.16);

  background:
  rgba(68,14,31,.46);

}



@keyframes
rigoAdminMessageIn{

  from{

    opacity:0;

    transform:
    translateY(7px);

  }

  to{

    opacity:1;

    transform:
    translateY(0);

  }

}



/* =====================================
   FORM
===================================== */

.rigo-admin-agent-form{

  display:grid;

  grid-template-columns:
  minmax(0,1fr)
  auto;

  gap:10px;

  margin-top:20px;

}



.rigo-admin-agent-input-wrap{

  position:relative;

  min-width:0;

}



.rigo-admin-agent-input-icon{

  position:absolute;

  left:17px;

  top:50%;

  z-index:2;

  width:21px;

  height:21px;

  display:grid;

  place-items:center;

  color:#7a8ba2;

  transform:
  translateY(-50%);

  pointer-events:none;

}



.rigo-admin-agent-input-icon svg{

  width:100%;

  height:100%;

  fill:none;

  stroke:currentColor;

  stroke-width:1.8;

  stroke-linecap:round;

  stroke-linejoin:round;

}



.rigo-admin-agent-form input{

  width:100%;

  height:62px;

  box-sizing:border-box;

  padding:
  0
  18px
  0
  49px;

  color:#f0f6fd;

  font-family:inherit;

  font-size:15px;

  outline:none;

  border:1px solid
  rgba(21,230,160,.38);

  border-radius:15px;

  background:

    linear-gradient(
      145deg,
      rgba(9,24,42,.96),
      rgba(6,18,33,.96)
    );

  box-shadow:

    inset 0 1px 0
    rgba(255,255,255,.022),

    0 0 0 0
    rgba(21,230,160,0);

  transition:

    border-color .18s ease,
    box-shadow .18s ease,
    background .18s ease;

}



.rigo-admin-agent-form input::placeholder{

  color:#718096;

}



.rigo-admin-agent-form input:hover{

  border-color:
  rgba(21,230,160,.52);

}



.rigo-admin-agent-form input:focus{

  border-color:
  rgba(21,230,160,.8);

  background:

    linear-gradient(
      145deg,
      rgba(10,29,48,.98),
      rgba(6,21,36,.98)
    );

  box-shadow:

    0 0 0 4px
    rgba(21,230,160,.07),

    0 0 24px
    rgba(21,230,160,.055);

}



.rigo-admin-agent-form input:disabled{

  opacity:.56;

  cursor:not-allowed;

}



.rigo-admin-agent-submit{

  min-width:130px;

  height:62px;

  display:inline-flex;

  align-items:center;

  justify-content:center;

  gap:10px;

  padding:0 24px;

  color:#ffffff;

  font-family:inherit;

  font-size:16px;

  font-weight:720;

  cursor:pointer;

  border:1px solid
  rgba(78,255,197,.22);

  border-radius:15px;

  background:

    linear-gradient(
      135deg,
      #087553,
      #0ebf87
    );

  box-shadow:

    inset 0 1px 0
    rgba(255,255,255,.15),

    0 10px 28px
    rgba(9,176,124,.18);

  transition:

    transform .18s ease,
    filter .18s ease,
    box-shadow .18s ease;

}



.rigo-admin-agent-submit:hover{

  transform:
  translateY(-2px);

  filter:
  brightness(1.08);

  box-shadow:

    inset 0 1px 0
    rgba(255,255,255,.18),

    0 14px 32px
    rgba(9,196,138,.23);

}



.rigo-admin-agent-submit:active{

  transform:
  translateY(0);

}



.rigo-admin-agent-submit:disabled{

  opacity:.55;

  cursor:not-allowed;

  transform:none;

  filter:none;

}



.rigo-admin-agent-submit svg{

  width:22px;

  height:22px;

  fill:none;

  stroke:currentColor;

  stroke-width:1.8;

  stroke-linecap:round;

  stroke-linejoin:round;

}



/* =====================================
   LOADING
===================================== */

.rigo-admin-agent-loading{

  display:inline-flex;

  align-items:center;

  gap:7px;

}



.rigo-admin-agent-loading-dot{

  width:5px;

  height:5px;

  border-radius:50%;

  background:currentColor;

  animation:

    rigoAdminLoading
    1s ease-in-out infinite;

}



.rigo-admin-agent-loading-dot:nth-child(2){

  animation-delay:.12s;

}



.rigo-admin-agent-loading-dot:nth-child(3){

  animation-delay:.24s;

}



@keyframes
rigoAdminLoading{

  0%,
  100%{

    opacity:.35;

    transform:
    translateY(0);

  }

  50%{

    opacity:1;

    transform:
    translateY(-3px);

  }

}



/* =====================================
   RESPONSIVE
===================================== */

@media(
  max-width:1250px
){

  .rigo-admin-agent-quick-actions{

    grid-template-columns:

      repeat(
        3,
        minmax(160px,1fr)
      );

  }

}



@media(
  max-width:800px
){

  .rigo-admin-agent-page{

    min-height:
    calc(100vh - 92px);

    padding:20px;

    border-radius:18px;

  }

  .rigo-admin-agent-header{

    align-items:stretch;

    flex-direction:column;

  }

  .rigo-admin-agent-access{

    width:max-content;

  }

  .rigo-admin-agent-avatar{

    width:72px;

    height:72px;

    border-radius:20px;

  }

  .rigo-admin-agent-avatar svg{

    width:40px;

    height:40px;

  }

  .rigo-admin-agent-title-line h1{

    font-size:32px;

  }

  .rigo-admin-agent-description{

    font-size:14px;

  }

  .rigo-admin-agent-quick-actions{

    grid-template-columns:

      repeat(
        2,
        minmax(0,1fr)
      );

  }

  .rigo-admin-agent-console{

    min-height:320px;

    padding:17px;

    border-radius:16px;

  }

  .rigo-admin-agent-form{

    grid-template-columns:1fr;

  }

  .rigo-admin-agent-submit{

    width:100%;

  }

}



@media(
  max-width:520px
){

  .rigo-admin-agent-page{

    padding:15px;

  }

  .rigo-admin-agent-identity{

    align-items:flex-start;

    gap:13px;

  }

  .rigo-admin-agent-avatar{

    width:58px;

    height:58px;

    border-radius:17px;

  }

  .rigo-admin-agent-avatar svg{

    width:32px;

    height:32px;

  }

  .rigo-admin-agent-title-line{

    gap:7px;

  }

  .rigo-admin-agent-title-line h1{

    font-size:27px;

    letter-spacing:-.7px;

  }

  .rigo-admin-agent-shield{

    width:23px;

    height:23px;

  }

  .rigo-admin-agent-quick-actions{

    grid-template-columns:1fr;

  }

  .rigo-admin-agent-action{

    height:54px;

  }

  .rigo-admin-agent-message{

    width:100%;

  }

  .rigo-admin-agent-message-icon{

    width:34px;

    height:34px;

  }

  .rigo-admin-agent-console{

    min-height:300px;

    padding:14px;

  }

  .rigo-admin-agent-form input,
  .rigo-admin-agent-submit{

    height:56px;

  }

}

`;

  document.head.appendChild(
    style
  );

  return true;

}



// =====================================
// ACTION BUTTON
// =====================================

function renderActionButton({

  command,

  label,

  icon,

  tone,

  loading

}){

  return `
    <button
      class="rigo-admin-agent-action ${escapeHTML(tone)}"
      type="button"
      data-admin-command="${escapeHTML(command)}"
      ${loading ? "disabled" : ""}
    >
      <span class="rigo-admin-agent-action-icon">
        ${icon}
      </span>

      <span class="rigo-admin-agent-action-label">
        ${escapeHTML(label)}
      </span>
    </button>
  `;

}



// =====================================
// RENDER EMPTY STATE
// =====================================

function renderEmptyState(){

  return `
    <div class="rigo-admin-agent-empty">

      <div class="rigo-admin-agent-empty-avatar">
        ${ICONS.admin}
      </div>

      <div class="rigo-admin-agent-empty-content">

        <div class="rigo-admin-agent-empty-heading">

          <span class="rigo-admin-agent-empty-name">
            Admin Agent
          </span>

          <span class="rigo-admin-agent-empty-time">
            ${escapeHTML(formatTime())}
          </span>

        </div>

        <div class="rigo-admin-agent-empty-message">
          Admin Agent is ready. Run a command.
        </div>

        <div class="rigo-admin-agent-empty-subtitle">
          How can I help you today?
        </div>

      </div>

    </div>
  `;

}



// =====================================
// RENDER MESSAGE
// =====================================

function renderMessage(
  message = {}
){

  const role =
  normalizeRole(
    message.role
  );

  const roleLabel =

    role === "user"
    ? "You"

    : role === "system"
    ? "System"

    : role === "error"
    ? "Error"

    : "Admin Agent";

  const messageIcon =

    role === "user"
    ? ICONS.user

    : role === "system"
    ? ICONS.terminal

    : ICONS.admin;

  return `
    <article class="rigo-admin-agent-message ${escapeHTML(role)}">

      <div class="rigo-admin-agent-message-icon">
        ${messageIcon}
      </div>

      <div class="rigo-admin-agent-message-main">

        <div class="rigo-admin-agent-message-header">

          <span class="rigo-admin-agent-role">
            ${escapeHTML(roleLabel)}
          </span>

          <span class="rigo-admin-agent-message-time">
            ${escapeHTML(
              formatTime(
                message.timestamp
              )
            )}
          </span>

        </div>

        <pre>${formatOutput(message.content)}</pre>

      </div>

    </article>
  `;

}



// =====================================
// RENDER MESSAGES
// =====================================

function renderMessages(
  messages = []
){

  if(
    !Array.isArray(
      messages
    )
    ||
    !messages.length
  ){

    return renderEmptyState();

  }

  return messages
  .map(
    renderMessage
  )
  .join("");

}



// =====================================
// RENDER LOADING LABEL
// =====================================

function renderLoadingLabel(){

  return `
    <span class="rigo-admin-agent-loading">

      <span class="rigo-admin-agent-loading-dot"></span>

      <span class="rigo-admin-agent-loading-dot"></span>

      <span class="rigo-admin-agent-loading-dot"></span>

    </span>
  `;

}



// =====================================
// RENDER LAYOUT
// =====================================

function renderLayout(
  state = {}
){

  mountStyles();

  const admin =
  state.admin || {

    available:
    false,

    status:
    "unknown"

  };

  const available =
  Boolean(
    admin.available
  );

  const loading =
  Boolean(
    state.loading
  );

  const actions =
  [

    {

      command:
      "scan project",

      label:
      "Scan Project",

      icon:
      ICONS.search,

      tone:
      "scan"

    },

    {

      command:
      "project snapshot",

      label:
      "Project Snapshot",

      icon:
      ICONS.snapshot,

      tone:
      "snapshot"

    },

    {

      command:
      "list files",

      label:
      "List Files",

      icon:
      ICONS.file,

      tone:
      "files"

    },

    {

      command:
      "list folders",

      label:
      "List Folders",

      icon:
      ICONS.folder,

      tone:
      "folders"

    },

    {

      command:
      "list systems",

      label:
      "List Systems",

      icon:
      ICONS.system,

      tone:
      "systems"

    },

    {

      command:
      "analyze code",

      label:
      "Analyze Code",

      icon:
      ICONS.code,

      tone:
      "analyze"

    }

  ];

  return `
    <div class="rigo-admin-agent-page">

      <header class="rigo-admin-agent-header">

        <div class="rigo-admin-agent-identity">

          <div class="rigo-admin-agent-avatar">
            ${ICONS.admin}
          </div>

          <div class="rigo-admin-agent-heading">

            <div class="rigo-admin-agent-title-line">

              <h1>
                Admin Agent
              </h1>

              <span class="rigo-admin-agent-shield">
                ${ICONS.shield}
              </span>

            </div>

            <p class="rigo-admin-agent-description">
              Private command console connected to RIGO Admin Agent.
            </p>

            <span
              class="rigo-admin-agent-status"
              data-available="${available}"
              data-status="${escapeHTML(admin.status)}"
            >
              ${
                available
                ? "ADMIN CONNECTED"
                : "ADMIN MISSING"
              }
            </span>

          </div>

        </div>

        <div class="rigo-admin-agent-access">

          <span class="rigo-admin-agent-access-icon">
            ${ICONS.shield}
          </span>

          <span>
            Private Admin Access
          </span>

        </div>

      </header>

      <section class="rigo-admin-agent-quick-actions">

        ${
          actions
          .map(
            function(action){

              return renderActionButton({

                ...action,

                loading

              });

            }
          )
          .join("")
        }

      </section>

      <section class="rigo-admin-agent-console">
        ${renderMessages(state.messages)}
      </section>

      <form
        class="rigo-admin-agent-form"
        data-admin-agent-form
      >

        <div class="rigo-admin-agent-input-wrap">

          <span class="rigo-admin-agent-input-icon">
            ${ICONS.terminal}
          </span>

          <input
            type="text"
            autocomplete="off"
            spellcheck="false"
            data-admin-agent-input
            placeholder="Type admin command..."
            value="${escapeHTML(state.input || "")}"
            ${loading ? "disabled" : ""}
          >

        </div>

        <button
          class="rigo-admin-agent-submit"
          type="submit"
          ${loading ? "disabled" : ""}
        >

          ${
            loading
            ? renderLoadingLabel()
            : `
                ${ICONS.send}

                <span>
                  Send
                </span>
              `
          }

        </button>

      </form>

    </div>
  `;

}



// =====================================
// EXPORTS
// =====================================

export {

  escapeHTML,

  formatOutput,

  formatTime,

  mountStyles,

  renderMessages,

  renderLayout

};

export default
renderLayout;

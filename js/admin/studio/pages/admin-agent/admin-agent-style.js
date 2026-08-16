// =====================================
// RIGO AI
// ADMIN AGENT
// STYLE
// =====================================

const STYLE_ID =
"rigo-admin-agent-style";



// =====================================
// MOUNT STYLE
// =====================================

function mountStyle(){

  if(
    document.getElementById(
      STYLE_ID
    )
  ){

    return true;

  }

  const style =
  document.createElement(
    "style"
  );

  style.id =
  STYLE_ID;

  style.textContent = `

/* =====================================
   ROOT VARIABLES
===================================== */

.rigo-admin-agent-page{

  --admin-border:
  rgba(255,255,255,.08);

  --admin-border-green:
  rgba(25,227,156,.22);

  --admin-surface:
  rgba(8,18,33,.96);

  --admin-surface-strong:
  rgba(5,14,27,.98);

  --admin-text:
  #f4f8fd;

  --admin-text-soft:
  #93a4ba;

  --admin-text-muted:
  #64748b;

  --admin-green:
  #19e39c;

  --admin-blue:
  #29b9ff;

  --admin-yellow:
  #ffd029;

  --admin-purple:
  #b75cff;

  --admin-danger:
  #ff5577;

}



/* =====================================
   SVG RESET
===================================== */

.rigo-admin-agent-page svg{

  display:block;

  flex:none;

  max-width:none;

  max-height:none;

  fill:none;

  stroke:currentColor;

  stroke-linecap:round;

  stroke-linejoin:round;

  box-sizing:border-box;

}



/* =====================================
   PAGE
===================================== */

.rigo-admin-agent-page{

  position:relative;

  width:100%;

  height:100%;

  min-width:0;

  min-height:0;

  display:flex;

  flex-direction:column;

  gap:10px;

  padding:16px;

  overflow:hidden;

  box-sizing:border-box;

  color:var(--admin-text);

  border:1px solid
  var(--admin-border);

  border-radius:18px;

  background:

    radial-gradient(
      circle at 86% 20%,
      rgba(25,227,156,.045),
      transparent 30%
    ),

    linear-gradient(
      145deg,
      #050e1d,
      #020817
    );

}



/* =====================================
   HEADER
===================================== */

.rigo-admin-agent-header{

  flex:0 0 auto;

  display:grid;

  grid-template-columns:
  minmax(0,1fr)
  auto;

  align-items:center;

  gap:16px;

  padding:13px 15px;

  border:1px solid
  var(--admin-border);

  border-radius:14px;

  background:

    linear-gradient(
      145deg,
      rgba(9,21,38,.98),
      rgba(5,14,27,.98)
    );

}



.rigo-admin-agent-identity{

  min-width:0;

  display:flex;

  align-items:center;

  gap:13px;

}



.rigo-admin-agent-avatar{

  width:50px;

  height:50px;

  flex:0 0 50px;

  display:grid;

  place-items:center;

  overflow:hidden;

  color:var(--admin-green);

  border:1px solid
  rgba(25,227,156,.18);

  border-radius:15px;

  background:
  rgba(25,227,156,.07);

}



.rigo-admin-agent-avatar svg{

  width:25px !important;

  height:25px !important;
  
  stroke-width:1.8;

}



.rigo-admin-agent-heading{

  min-width:0;

}



.rigo-admin-agent-title-line{

  min-width:0;

  display:flex;

  align-items:center;

  gap:8px;

}



.rigo-admin-agent-title-line h1{

  margin:0;

  color:#ffffff;

  font-size:23px;

  font-weight:750;

  line-height:1.1;

  letter-spacing:-.55px;

}



.rigo-admin-agent-shield{

  width:19px;

  height:19px;

  flex:0 0 19px;

  display:grid;

  place-items:center;

  overflow:hidden;

  color:var(--admin-green);

}



.rigo-admin-agent-shield svg{

  width:19px !important;

  height:19px !important;

  stroke-width:1.8;

}



.rigo-admin-agent-description{

  margin:5px 0 0;

  color:var(--admin-text-soft);

  font-size:12px;

  line-height:1.45;

}



.rigo-admin-agent-status{

  width:max-content;

  display:inline-flex;

  align-items:center;

  gap:7px;

  margin-top:7px;

  color:var(--admin-text-muted);

  font-size:10px;

  font-weight:750;

  letter-spacing:.4px;

}



.rigo-admin-agent-status::before{

  content:"";

  width:7px;

  height:7px;

  flex:0 0 7px;

  border-radius:50%;

  background:#66758a;

}



.rigo-admin-agent-status[data-available="true"]{

  color:var(--admin-green);

}



.rigo-admin-agent-status[data-available="true"]::before{

  background:var(--admin-green);

  box-shadow:
  0 0 10px
  rgba(25,227,156,.75);

}



.rigo-admin-agent-status[data-status="error"],
.rigo-admin-agent-status[data-status="missing"]{

  color:var(--admin-danger);

}



.rigo-admin-agent-status[data-status="error"]::before,
.rigo-admin-agent-status[data-status="missing"]::before{

  background:var(--admin-danger);

}



/* =====================================
   ACCESS BADGE
===================================== */

.rigo-admin-agent-access{

  flex:0 0 auto;

  display:flex;

  align-items:center;

  gap:8px;

  padding:9px 12px;

  color:#c7d3e3;

  font-size:11px;

  font-weight:650;

  white-space:nowrap;

  border:1px solid
  var(--admin-border);

  border-radius:11px;

  background:
  rgba(255,255,255,.025);

}



.rigo-admin-agent-access-icon{

  width:17px;

  height:17px;

  flex:0 0 17px;

  display:grid;

  place-items:center;

  overflow:hidden;

  color:var(--admin-green);

}



.rigo-admin-agent-access-icon svg{

  width:17px !important;

  height:17px !important;

  stroke-width:1.8;

}



/* =====================================
   QUICK ACTIONS
===================================== */

.rigo-admin-agent-quick-actions{

  flex:0 0 auto;

  width:100%;

  display:grid;

  grid-template-columns:
  repeat(
    6,
    minmax(0,1fr)
  );

  gap:9px;

}



.rigo-admin-agent-action{

  position:relative;

  min-width:0;

  height:40px;

  display:flex;

  align-items:center;

  justify-content:center;

  gap:8px;

  padding:0 10px;

  overflow:hidden;

  color:#dce5f1;

  font-family:inherit;

  font-size:11px;

  font-weight:650;

  white-space:nowrap;

  cursor:pointer;

  border:1px solid
  var(--admin-border);

  border-radius:11px;

  background:

    linear-gradient(
      145deg,
      rgba(10,23,40,.96),
      rgba(5,15,28,.96)
    );

  transition:

    transform .18s ease,
    border-color .18s ease,
    background .18s ease;

}



.rigo-admin-agent-action:hover{

  transform:
  translateY(-1px);

  border-color:
  rgba(25,227,156,.28);

  background:

    linear-gradient(
      145deg,
      rgba(12,31,47,.98),
      rgba(6,20,33,.98)
    );

}



.rigo-admin-agent-action:active{

  transform:none;

}



.rigo-admin-agent-action:disabled{

  opacity:.5;

  cursor:not-allowed;

  transform:none;

}



.rigo-admin-agent-action-icon{

  width:17px;

  height:17px;

  flex:0 0 17px;

  display:grid;

  place-items:center;

  overflow:hidden;

}



.rigo-admin-agent-action-icon svg,
.rigo-admin-agent-action svg{

  width:17px !important;

  height:17px !important;

  stroke-width:1.85;

}



.rigo-admin-agent-action-label{

  min-width:0;

  overflow:hidden;

  color:#e5edf7;

  text-overflow:ellipsis;

}



.rigo-admin-agent-action.scan,
.rigo-admin-agent-action.snapshot{

  color:var(--admin-green);

}



.rigo-admin-agent-action.files{

  color:var(--admin-blue);

}



.rigo-admin-agent-action.folders{

  color:var(--admin-yellow);

}



.rigo-admin-agent-action.systems{

  color:#65d9c3;

}



.rigo-admin-agent-action.analyze{

  color:var(--admin-purple);

}



/* =====================================
   CONSOLE
===================================== */

.rigo-admin-agent-console{

  position:relative;

  flex:1 1 auto;

  min-width:0;

  min-height:150px;

  display:flex;

  flex-direction:column;

  gap:9px;

  padding:12px;

  overflow:auto;

  overscroll-behavior:contain;

  scrollbar-width:thin;

  scrollbar-color:
  rgba(110,145,186,.28)
  transparent;

  border:1px solid
  var(--admin-border);

  border-radius:13px;

  background:

    radial-gradient(
      circle at 90% 40%,
      rgba(25,227,156,.025),
      transparent 28%
    ),

    linear-gradient(
      145deg,
      rgba(4,14,27,.96),
      rgba(2,9,20,.98)
    );

}



.rigo-admin-agent-console::-webkit-scrollbar{

  width:6px;

}



.rigo-admin-agent-console::-webkit-scrollbar-thumb{

  border-radius:999px;

  background:
  rgba(110,145,186,.28);

}



/* =====================================
   EMPTY STATE
===================================== */

.rigo-admin-agent-empty{

  display:flex;

  align-items:flex-start;

  gap:10px;

}



.rigo-admin-agent-empty-avatar{

  width:37px;

  height:37px;

  flex:0 0 37px;

  display:grid;

  place-items:center;

  overflow:hidden;

  color:var(--admin-green);

  border:1px solid
  rgba(25,227,156,.13);

  border-radius:11px;

  background:
  rgba(25,227,156,.07);

}



.rigo-admin-agent-empty-avatar svg{

  width:20px !important;

  height:20px !important;

  stroke-width:1.8;

}



.rigo-admin-agent-empty-content{

  min-width:0;

}



.rigo-admin-agent-empty-heading{

  display:flex;

  align-items:center;

  gap:8px;

  margin-bottom:4px;

}



.rigo-admin-agent-empty-name{

  color:#f3f7fc;

  font-size:12px;

  font-weight:700;

}



.rigo-admin-agent-empty-time{

  color:var(--admin-text-muted);

  font-size:10px;

}



.rigo-admin-agent-empty-message{

  color:#d9e3ef;

  font-size:12px;

  line-height:1.45;

}



.rigo-admin-agent-empty-subtitle{

  margin-top:4px;

  color:#75859c;

  font-size:11px;

}



/* =====================================
   MESSAGES
===================================== */

.rigo-admin-agent-message{

  width:min(760px,90%);

  display:flex;

  align-items:flex-start;

  gap:9px;

}



.rigo-admin-agent-message.user{

  margin-left:auto;

  flex-direction:row-reverse;

}



.rigo-admin-agent-message-icon{

  width:31px;

  height:31px;

  flex:0 0 31px;

  display:grid;

  place-items:center;

  overflow:hidden;

  color:var(--admin-green);

  border:1px solid
  rgba(25,227,156,.13);

  border-radius:10px;

  background:
  rgba(25,227,156,.07);

}



.rigo-admin-agent-message.user
.rigo-admin-agent-message-icon{

  color:var(--admin-blue);

  border-color:
  rgba(41,185,255,.14);

  background:
  rgba(41,185,255,.07);

}



.rigo-admin-agent-message.error
.rigo-admin-agent-message-icon{

  color:var(--admin-danger);

}



.rigo-admin-agent-message-icon svg{

  width:17px !important;

  height:17px !important;

  stroke-width:1.85;

}



.rigo-admin-agent-message-main{

  min-width:0;

  flex:1;

}



.rigo-admin-agent-message-header{

  display:flex;

  align-items:center;

  gap:7px;

  margin-bottom:5px;

}



.rigo-admin-agent-message.user
.rigo-admin-agent-message-header{

  justify-content:flex-end;

}



.rigo-admin-agent-role{

  color:#eef4fb;

  font-size:11px;

  font-weight:700;

}



.rigo-admin-agent-message-time{

  color:var(--admin-text-muted);

  font-size:9px;

}



.rigo-admin-agent-message pre{

  width:100%;

  margin:0;

  padding:9px 11px;

  overflow:auto;

  box-sizing:border-box;

  color:#ccd7e6;

  white-space:pre-wrap;

  overflow-wrap:anywhere;

  font-family:

    "SFMono-Regular",
    Consolas,
    monospace;

  font-size:10px;

  line-height:1.55;

  border:1px solid
  rgba(255,255,255,.06);

  border-radius:10px;

  background:
  rgba(8,20,35,.72);

}



/* =====================================
   FORM
===================================== */

.rigo-admin-agent-form{

  flex:0 0 auto;

  width:100%;

  display:grid;

  grid-template-columns:
  minmax(0,1fr)
  92px;

  gap:9px;

}



.rigo-admin-agent-input-wrap{

  position:relative;

  min-width:0;

}



.rigo-admin-agent-input-icon{

  position:absolute;

  left:13px;

  top:50%;

  z-index:2;

  width:16px;

  height:16px;

  display:grid;

  place-items:center;

  overflow:hidden;

  color:#77889f;

  transform:
  translateY(-50%);

  pointer-events:none;

}



.rigo-admin-agent-input-icon svg{

  width:16px !important;

  height:16px !important;

  stroke-width:1.8;

}



.rigo-admin-agent-form input{

  width:100%;

  height:41px;

  box-sizing:border-box;

  padding:
  0
  13px
  0
  39px;

  color:#eef5fd;

  font-family:inherit;

  font-size:12px;

  outline:none;

  border:1px solid
  rgba(25,227,156,.22);

  border-radius:11px;

  background:
  #07111f;

  transition:

    border-color .18s ease,
    box-shadow .18s ease;

}



.rigo-admin-agent-form input::placeholder{

  color:#718096;

}



.rigo-admin-agent-form input:focus{

  border-color:
  rgba(25,227,156,.65);

  box-shadow:
  0 0 0 3px
  rgba(25,227,156,.06);

}



.rigo-admin-agent-submit{

  width:92px;

  height:41px;

  display:inline-flex;

  align-items:center;

  justify-content:center;

  gap:7px;

  padding:0 14px;

  overflow:hidden;

  color:#ffffff;

  font-family:inherit;

  font-size:12px;

  font-weight:700;

  cursor:pointer;

  border:1px solid
  rgba(255,255,255,.08);

  border-radius:11px;

  background:

    linear-gradient(
      135deg,
      #087654,
      #15c98d
    );

  transition:

    transform .18s ease,
    filter .18s ease;

}



.rigo-admin-agent-submit:hover{

  transform:
  translateY(-1px);

  filter:
  brightness(1.08);

}



.rigo-admin-agent-submit:disabled{

  opacity:.55;

  cursor:not-allowed;

  transform:none;

}



.rigo-admin-agent-submit svg{

  width:16px !important;

  height:16px !important;

  flex:0 0 16px;

  stroke-width:1.8;

}



/* =====================================
   LOADING
===================================== */

.rigo-admin-agent-loading{

  display:inline-flex;

  align-items:center;

  gap:4px;

}



.rigo-admin-agent-loading-dot{

  width:4px;

  height:4px;

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
    translateY(-2px);

  }

}




/* PENDING CHANGES */
.rigo-admin-pending{flex:0 0 auto;padding:11px;border:1px solid var(--admin-border);border-radius:13px;background:rgba(5,14,27,.92)}
.rigo-admin-pending-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.rigo-admin-pending-head>div{display:flex;align-items:baseline;gap:8px}.rigo-admin-pending-head strong{font-size:12px}.rigo-admin-pending-head span{color:var(--admin-text-muted);font-size:10px}
.rigo-admin-pending-head button,.rigo-admin-plan-actions button{padding:6px 9px;color:var(--admin-text);font:600 10px inherit;border:1px solid var(--admin-border);border-radius:8px;background:rgba(255,255,255,.04);cursor:pointer}
.rigo-admin-pending-list{display:flex;flex-direction:column;gap:7px;max-height:180px;overflow:auto}.rigo-admin-pending-empty{margin:0;color:var(--admin-text-muted);font-size:11px}
.rigo-admin-plan{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px;border:1px solid var(--admin-border);border-left:3px solid var(--admin-yellow);border-radius:9px;background:rgba(255,255,255,.025)}
.rigo-admin-plan[data-risk="high"]{border-left-color:var(--admin-danger)}.rigo-admin-plan-info{min-width:0;display:flex;flex-direction:column;gap:3px}.rigo-admin-plan-info strong{font-size:11px}.rigo-admin-plan-info span,.rigo-admin-plan-info small{color:var(--admin-text-muted);font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rigo-admin-plan-actions{display:flex;gap:5px}.rigo-admin-plan-actions button[data-admin-plan-action="approve"]{color:var(--admin-green)}.rigo-admin-plan-actions button[data-admin-plan-action="execute"]{color:var(--admin-blue)}.rigo-admin-plan-actions button[data-admin-plan-action="cancel"]{color:var(--admin-danger)}.rigo-admin-plan-actions button:disabled{opacity:.4;cursor:not-allowed}
@media(max-width:760px){.rigo-admin-plan{align-items:flex-start;flex-direction:column}.rigo-admin-plan-actions{width:100%}.rigo-admin-plan-actions button{flex:1}}

/* =====================================
   RESPONSIVE
===================================== */

@media(
  max-width:1200px
){

  .rigo-admin-agent-quick-actions{

    grid-template-columns:
    repeat(
      3,
      minmax(0,1fr)
    );

  }

}



@media(
  max-width:760px
){

  .rigo-admin-agent-page{

    height:auto;

    min-height:100%;

    overflow:visible;

    padding:12px;

  }

  .rigo-admin-agent-header{

    grid-template-columns:1fr;

  }

  .rigo-admin-agent-access{

    width:max-content;

  }

  .rigo-admin-agent-quick-actions{

    grid-template-columns:
    repeat(
      2,
      minmax(0,1fr)
    );

  }

  .rigo-admin-agent-console{

    min-height:280px;

  }

}



@media(
  max-width:480px
){

  .rigo-admin-agent-quick-actions{

    grid-template-columns:1fr;

  }

  .rigo-admin-agent-form{

    grid-template-columns:1fr;

  }

  .rigo-admin-agent-submit{

    width:100%;

  }

}

`;

  document.head.appendChild(
    style
  );

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  mountStyle

};

export default
mountStyle;

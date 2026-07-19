// =====================================
// RIGO AI
// STUDIO SIDEBAR STYLE
// =====================================

let mounted =
false;



function mountSidebarStyle(){

  if(
    mounted
  ){

    return;

  }

  mounted =
  true;

  const style =
  document.createElement(
    "style"
  );

  style.id =
  "rigo-studio-sidebar-style";

  style.textContent = `

/* =====================================
   ROOT
===================================== */

.rigo-sidebar{

  width:84px;

  height:100%;

  display:flex;

  flex-direction:column;

  align-items:center;

  gap:14px;

  padding:18px 10px;

  box-sizing:border-box;

  background:#171A20;

  border-right:1px solid #242933;

}



/* =====================================
   SCROLL
===================================== */

.rigo-sidebar-scroll{

  width:100%;

  display:flex;

  flex-direction:column;

  align-items:center;

  gap:12px;

}



/* =====================================
   BUTTON
===================================== */

.rigo-sidebar-button{

  width:60px;

  height:60px;

  border:none;

  outline:none;

  cursor:pointer;

  display:flex;

  align-items:center;

  justify-content:center;

  border-radius:18px;

  background:transparent;

  transition:

    background .18s,

    transform .18s,

    box-shadow .18s;

}



/* =====================================
   ICON
===================================== */

.rigo-sidebar-icon{

  width:30px;

  height:30px;

  display:block;

}



/* =====================================
   HOVER
===================================== */

.rigo-sidebar-button:hover{

  background:#232A35;

  transform:translateY(-2px);

}



/* =====================================
   ACTIVE
===================================== */

.rigo-sidebar-button.active{

  background:#2D3644;

  box-shadow:

    inset 0 0 0 1px rgba(255,255,255,.05),

    0 8px 24px rgba(0,0,0,.28);

}



/* =====================================
   ACTIVE BAR
===================================== */

.rigo-sidebar-button.active::before{

  content:"";

  position:absolute;

  left:-10px;

  width:4px;

  height:32px;

  border-radius:10px;

  background:#3CCF91;

}



/* =====================================
   LABEL
===================================== */

.rigo-sidebar-label{

  margin-top:6px;

  font-size:11px;

  font-weight:600;

  color:#9AA4B2;

  text-align:center;

  user-select:none;

}



/* =====================================
   ACTIVE LABEL
===================================== */

.rigo-sidebar-button.active
+.rigo-sidebar-label{

  color:#FFFFFF;

}



/* =====================================
   WRAPPER
===================================== */

.rigo-sidebar-item{

  position:relative;

  display:flex;

  flex-direction:column;

  align-items:center;

}



/* =====================================
   TOOLTIP
===================================== */

.rigo-sidebar-tooltip{

  position:absolute;

  left:74px;

  top:50%;

  transform:translateY(-50%);

  opacity:0;

  pointer-events:none;

  padding:8px 12px;

  border-radius:10px;

  background:#262D39;

  color:white;

  font-size:13px;

  white-space:nowrap;

  transition:.15s;

}



.rigo-sidebar-item:hover
.rigo-sidebar-tooltip{

  opacity:1;

}



/* =====================================
   RESPONSIVE
===================================== */

@media(max-width:900px){

  .rigo-sidebar{

    width:74px;

  }

  .rigo-sidebar-button{

    width:54px;

    height:54px;

  }

  .rigo-sidebar-icon{

    width:27px;

    height:27px;

  }

}

`;

  document.head.appendChild(
    style
  );

}



export {

  mountSidebarStyle

};

export default
mountSidebarStyle;

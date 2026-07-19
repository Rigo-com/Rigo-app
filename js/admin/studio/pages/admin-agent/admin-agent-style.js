// =====================================
// RIGO AI
// ADMIN AGENT
// STYLE
// =====================================

const STYLE_ID =
"rigo-admin-agent-style";



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

:root{

  --admin-radius:16px;

  --admin-gap:16px;

  --admin-border:
  rgba(255,255,255,.08);

  --admin-surface:
  rgba(10,18,32,.96);

  --admin-surface-2:
  rgba(13,23,40,.96);

  --admin-green:
  #19e39c;

}



/* ========================= */

.rigo-admin-agent-page{

  display:flex;

  flex-direction:column;

  width:100%;

  height:100%;

  min-height:100%;

  padding:20px;

  gap:16px;

  box-sizing:border-box;

}



/* ========================= */

.rigo-admin-agent-header{

  display:grid;

  grid-template-columns:

  1fr auto;

  align-items:center;

  gap:24px;

  padding:20px;

  border-radius:18px;

  border:1px solid var(--admin-border);

  background:

  linear-gradient(

    180deg,

    #09111f,

    #060d19

  );

}



/* ========================= */

.rigo-admin-agent-identity{

  display:flex;

  align-items:center;

  gap:18px;

}



.rigo-admin-agent-avatar{

  width:72px;

  height:72px;

  border-radius:20px;

  display:flex;

  align-items:center;

  justify-content:center;

  background:

  rgba(25,227,156,.08);

  border:

  1px solid rgba(25,227,156,.15);

}



.rigo-admin-agent-avatar svg{

  width:36px;

  height:36px;

}



/* ========================= */

.rigo-admin-agent-title{

  font-size:28px;

  font-weight:700;

  color:white;

  margin:0;

}



.rigo-admin-agent-description{

  margin-top:6px;

  font-size:14px;

  color:#8fa1b7;

}



.rigo-admin-agent-status{

  margin-top:12px;

  font-size:13px;

  color:var(--admin-green);

}



/* ========================= */

.rigo-admin-agent-access{

  padding:

  12px 18px;

  border-radius:14px;

  background:

  rgba(255,255,255,.03);

  border:

  1px solid var(--admin-border);

}



/* ========================= */

.rigo-admin-agent-quick-actions{

  display:grid;

  grid-template-columns:

  repeat(6,1fr);

  gap:14px;

}



/* ========================= */

.rigo-admin-agent-action{

  height:56px;

  border-radius:14px;

  border:

  1px solid var(--admin-border);

  background:

  var(--admin-surface);

  display:flex;

  align-items:center;

  gap:10px;

  padding:0 18px;

  cursor:pointer;

  transition:.2s;

}



.rigo-admin-agent-action:hover{

  transform:

  translateY(-2px);

  border-color:

  rgba(25,227,156,.25);

}



.rigo-admin-agent-action svg{

  width:20px;

  height:20px;

}



/* ========================= */

.rigo-admin-agent-console{

  flex:1;

  min-height:0;

  overflow:auto;

  display:flex;

  flex-direction:column;

  gap:14px;

  padding:18px;

  border-radius:18px;

  border:

  1px solid var(--admin-border);

  background:

  linear-gradient(

    180deg,

    #07101d,

    #040b16

  );

}



/* ========================= */

.rigo-admin-agent-message{

  border-radius:16px;

  padding:18px;

  border:

  1px solid rgba(255,255,255,.05);

  background:

  rgba(255,255,255,.015);

}



/* ========================= */

.rigo-admin-agent-form{

  display:grid;

  grid-template-columns:

  1fr 130px;

  gap:12px;

}



.rigo-admin-agent-form input{

  height:56px;

  border-radius:14px;

  border:

  1px solid rgba(25,227,156,.20);

  background:

  #08111f;

  padding:

  0 18px;

  color:white;

  font-size:15px;

}



.rigo-admin-agent-submit{

  border:none;

  border-radius:14px;

  background:

  linear-gradient(

    135deg,

    #0b7b57,

    #18d692

  );

  color:white;

  font-weight:600;

  cursor:pointer;

}



/* ========================= */

@media(max-width:1400px){

  .rigo-admin-agent-quick-actions{

    grid-template-columns:

    repeat(3,1fr);

  }

}



@media(max-width:900px){

  .rigo-admin-agent-header{

    grid-template-columns:1fr;

  }

  .rigo-admin-agent-quick-actions{

    grid-template-columns:

    repeat(2,1fr);

  }

  .rigo-admin-agent-form{

    grid-template-columns:1fr;

  }

}



@media(max-width:600px){

  .rigo-admin-agent-quick-actions{

    grid-template-columns:1fr;

  }

}

`;

  document.head.appendChild(
    style
  );

  return true;

}



export {

  mountStyle

};

export default
mountStyle;

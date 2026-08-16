// =====================================
// RIGO AI
// STUDIO DASHBOARD WIDGETS
// =====================================



// =====================================
// FORMATTERS
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



function formatNumber(
  value
){

  const number =
  Number(
    value || 0
  );

  if(
    !Number.isFinite(number)
  ){

    return "0";

  }

  return number
  .toLocaleString(
    "en-US"
  );

}



function formatStatus(
  value
){

  return String(
    value || "unknown"
  )
  .replaceAll(
    "-",
    " "
  )
  .replaceAll(
    "_",
    " "
  )
  .toUpperCase();

}



function formatDateTime(
  value
){

  if(
    !value
  ){

    return "-";

  }

  try{

    const date =
    new Date(
      value
    );

    if(
      Number.isNaN(
        date.getTime()
      )
    ){

      return "-";

    }

    return date
    .toLocaleString();

  }
  catch{

    return "-";

  }

}



// =====================================
// VALUE HELPERS
// =====================================

function getBooleanLabel(
  value
){

  return value
  ? "YES"
  : "NO";

}



function getStatusClass(
  value
){

  const normalized =
  String(
    value || ""
  )
  .trim()
  .toLowerCase();

  if(
    normalized === "connected" ||
    normalized === "indexed" ||
    normalized === "ready" ||
    normalized === "healthy" ||
    normalized === "available" ||
    normalized === "online" ||
    normalized === "completed" ||
    normalized === "active"
  ){

    return "success";

  }

  if(
    normalized === "waiting" ||
    normalized === "waiting-for-scan" ||
    normalized === "pending" ||
    normalized === "not-indexed" ||
    normalized === "unknown" ||
    normalized === "idle"
  ){

    return "warning";

  }

  if(
    normalized === "missing" ||
    normalized === "failed" ||
    normalized === "error" ||
    normalized === "unavailable" ||
    normalized === "offline" ||
    normalized === "disconnected"
  ){

    return "danger";

  }

  return "muted";

}



// =====================================
// STYLES
// =====================================

function renderDashboardStyles(){

  return `
    <style>

      /* =================================
         PAGE
      ================================= */

      .rigo-dashboard-page{
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        display:grid;
        grid-template-rows:
          auto
          auto
          minmax(0,1fr)
          auto;
        padding:
          clamp(14px,1.35vw,22px);
        overflow:hidden;
        color:#f8fafc;
        background:
          radial-gradient(
            circle at 12% -5%,
            rgba(16,185,129,.055),
            transparent 30%
          ),
          linear-gradient(
            145deg,
            #020817 0%,
            #030b18 55%,
            #020712 100%
          );
        font-family:
          Inter,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
        box-sizing:border-box;
      }

      .rigo-dashboard-page *,
      .rigo-dashboard-page *::before,
      .rigo-dashboard-page *::after{
        box-sizing:border-box;
      }

      .rigo-dashboard-mobile-control{
        display:none;
      }

      .rigo-dashboard-main{
        min-width:0;
        min-height:0;
        overflow:hidden;
      }


      /* =================================
         HEADER
      ================================= */

      .rigo-dashboard-header{
        min-width:0;
        display:flex;
        flex-direction:column;
        align-items:flex-start;
        gap:12px;
        margin-bottom:14px;
      }

      .rigo-dashboard-heading{
        min-width:0;
      }

      .rigo-dashboard-header h1{
        margin:0 0 5px;
        color:#f8fafc;
        font-size:
          clamp(
            26px,
            2.05vw,
            34px
          );
        line-height:1.05;
        font-weight:800;
        letter-spacing:-.75px;
      }

      .rigo-dashboard-header p{
        margin:0;
        color:#cbd5e1;
        font-size:
          clamp(
            12px,
            .9vw,
            14px
          );
        line-height:1.4;
      }

      .rigo-dashboard-actions{
        display:flex;
        align-items:center;
        gap:8px;
      }

      .rigo-dashboard-button{
        min-height:34px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:7px;
        padding:0 14px;
        border:1px solid rgba(16,185,129,.30);
        border-radius:8px;
        color:#34d399;
        background:
          linear-gradient(
            180deg,
            rgba(6,78,59,.21),
            rgba(6,48,42,.16)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025);
        font-family:inherit;
        font-size:12px;
        line-height:1;
        font-weight:700;
        white-space:nowrap;
        cursor:pointer;
        transition:
          background .16s ease,
          border-color .16s ease,
          transform .16s ease;
      }

      .rigo-dashboard-button:hover:not(:disabled){
        border-color:rgba(52,211,153,.58);
        background:rgba(6,95,70,.31);
        transform:translateY(-1px);
      }

      .rigo-dashboard-button.primary{
        color:#38bdf8;
        border-color:rgba(14,165,233,.36);
        background:
          linear-gradient(
            180deg,
            rgba(3,105,161,.20),
            rgba(3,64,99,.15)
          );
      }

      .rigo-dashboard-button.primary:hover:not(:disabled){
        border-color:rgba(56,189,248,.62);
        background:rgba(3,105,161,.29);
      }

      .rigo-dashboard-button:disabled{
        opacity:.52;
        cursor:not-allowed;
        transform:none;
      }

      .rigo-dashboard-button-icon{
        font-size:17px;
        line-height:1;
      }


      /* =================================
         ERROR
      ================================= */

      .rigo-dashboard-error{
        margin-bottom:10px;
        padding:9px 12px;
        overflow:hidden;
        border:1px solid rgba(248,113,113,.30);
        border-radius:8px;
        color:#fca5a5;
        background:rgba(127,29,29,.15);
        font-size:12px;
        line-height:1.4;
        text-overflow:ellipsis;
        white-space:nowrap;
      }


      /* =================================
         DASHBOARD GRID
      ================================= */

      .rigo-dashboard-content{
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        display:grid;
        grid-template-rows:
          minmax(88px,108px)
          minmax(190px,1fr)
          minmax(105px,120px);
        gap:
          clamp(
            10px,
            .9vw,
            14px
          );
        overflow:hidden;
      }


      /* =================================
         METRICS
      ================================= */

      .rigo-dashboard-metrics{
        min-width:0;
        min-height:0;
        display:grid;
        grid-template-columns:
          repeat(
            6,
            minmax(0,1fr)
          );
        gap:
          clamp(
            8px,
            .9vw,
            14px
          );
      }

      .rigo-dashboard-metric-card{
        position:relative;
        min-width:0;
        min-height:0;
        height:100%;
        display:flex;
        align-items:center;
        padding:
          12px
          clamp(11px,1vw,17px)
          16px;
        overflow:hidden;
        border:1px solid rgba(148,163,184,.14);
        border-radius:
          clamp(
            10px,
            .85vw,
            13px
          );
        background:
          linear-gradient(
            145deg,
            rgba(14,27,45,.96),
            rgba(7,16,29,.97)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025),
          0 10px 28px rgba(0,0,0,.16);
      }

      .rigo-dashboard-metric-main{
        width:100%;
        min-width:0;
        display:flex;
        align-items:center;
        gap:
          clamp(
            8px,
            .8vw,
            13px
          );
      }

      .rigo-dashboard-metric-icon{
        flex:0 0 auto;
        width:
          clamp(
            34px,
            3vw,
            43px
          );
        height:
          clamp(
            34px,
            3vw,
            43px
          );
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        border-radius:9px;
        color:var(
          --metric-color,
          #38bdf8
        );
        background:
          color-mix(
            in srgb,
            var(--metric-color,#38bdf8) 11%,
            rgba(8,17,31,.92)
          );
        box-shadow:
          inset 0 0 0 1px
          color-mix(
            in srgb,
            var(--metric-color,#38bdf8) 11%,
            transparent
          );
        font-size:
          clamp(
            20px,
            1.8vw,
            27px
          );
        line-height:1;
      }

      .rigo-dashboard-metric-value{
        min-width:0;
      }

      .rigo-dashboard-metric-value strong{
        display:block;
        overflow:hidden;
        color:#f8fafc;
        font-size:
          clamp(
            20px,
            1.8vw,
            27px
          );
        line-height:1;
        font-weight:800;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-dashboard-metric-value span{
        display:block;
        margin-top:5px;
        overflow:hidden;
        color:#cbd5e1;
        font-size:
          clamp(
            10px,
            .78vw,
            12px
          );
        line-height:1.2;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-dashboard-metric-line{
        position:absolute;
        right:
          clamp(
            11px,
            1vw,
            17px
          );
        bottom:10px;
        left:
          clamp(
            11px,
            1vw,
            17px
          );
        height:3px;
        border-radius:999px;
        background:var(
          --metric-color,
          #38bdf8
        );
        box-shadow:
          0 0 11px
          color-mix(
            in srgb,
            var(--metric-color,#38bdf8) 38%,
            transparent
          );
      }


      /* =================================
         PANELS
      ================================= */

      .rigo-dashboard-panels{
        min-width:0;
        min-height:0;
        display:grid;
        grid-template-columns:
          1fr
          1fr
          1fr;
        gap:
          clamp(
            10px,
            .9vw,
            14px
          );
        overflow:hidden;
      }

      .rigo-dashboard-widget{
        min-width:0;
        min-height:0;
        height:100%;
        padding:
          clamp(
            12px,
            1.1vw,
            17px
          );
        overflow:hidden;
        border:1px solid rgba(148,163,184,.14);
        border-radius:
          clamp(
            10px,
            .85vw,
            13px
          );
        background:
          linear-gradient(
            145deg,
            rgba(14,27,45,.96),
            rgba(7,16,29,.97)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025),
          0 10px 28px rgba(0,0,0,.16);
      }

      .rigo-dashboard-widget-header{
        min-width:0;
        display:flex;
        align-items:flex-start;
        gap:9px;
        margin-bottom:7px;
      }

      .rigo-dashboard-widget-icon{
        flex:0 0 auto;
        width:25px;
        min-width:25px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#34d399;
        font-size:20px;
        line-height:1.15;
      }

      .rigo-dashboard-widget-title{
        min-width:0;
      }

      .rigo-dashboard-widget-header h3{
        margin:0;
        overflow:hidden;
        color:#f8fafc;
        font-size:
          clamp(
            14px,
            1.05vw,
            17px
          );
        line-height:1.25;
        font-weight:800;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-dashboard-widget-header p{
        margin:4px 0 0;
        overflow:hidden;
        color:#cbd5e1;
        font-size:
          clamp(
            10px,
            .74vw,
            12px
          );
        line-height:1.35;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-dashboard-widget-body{
        min-width:0;
        min-height:0;
        margin-top:
          clamp(
            8px,
            .8vw,
            12px
          );
      }

      .rigo-dashboard-status-list{
        min-width:0;
        display:flex;
        flex-direction:column;
        gap:
          clamp(
            8px,
            .82vw,
            12px
          );
      }

      .rigo-dashboard-status-row{
        min-width:0;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
      }

      .rigo-dashboard-status-row > span:first-child{
        flex:0 0 auto;
        color:#e2e8f0;
        font-size:
          clamp(
            10px,
            .8vw,
            12px
          );
        line-height:1.25;
        white-space:nowrap;
      }

      .rigo-dashboard-status-value{
        min-width:0;
        max-width:65%;
        display:block;
        overflow:hidden;
        color:#f8fafc;
        font-size:
          clamp(
            10px,
            .8vw,
            12px
          );
        line-height:1.25;
        font-weight:700;
        text-align:right;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-dashboard-status-value.success{
        color:#34d399;
      }

      .rigo-dashboard-status-value.warning{
        color:#facc15;
      }

      .rigo-dashboard-status-value.danger{
        color:#fb7185;
      }

      .rigo-dashboard-status-value.muted{
        color:#94a3b8;
      }

      .rigo-dashboard-status-dot{
        display:inline-block;
        width:8px;
        height:8px;
        margin-right:7px;
        border-radius:50%;
        vertical-align:1px;
        background:#facc15;
        box-shadow:
          0 0 9px
          rgba(250,204,21,.65);
      }


      /* =================================
         DEBUG
      ================================= */

      .rigo-dashboard-debug{
        min-width:0;
        min-height:0;
        grid-column:1 / -1;
        padding-top:
          clamp(
            10px,
            .9vw,
            14px
          );
        padding-bottom:
          clamp(
            10px,
            .9vw,
            14px
          );
      }

      .rigo-dashboard-debug
      .rigo-dashboard-widget-header{
        margin-bottom:3px;
      }

      .rigo-dashboard-debug
      .rigo-dashboard-widget-body{
        margin-top:6px;
      }

      .rigo-dashboard-debug-grid{
        min-width:0;
        display:grid;
        grid-template-columns:
          repeat(
            6,
            minmax(0,1fr)
          );
      }

      .rigo-dashboard-debug-item{
        min-width:0;
        padding:1px 11px;
        border-right:1px solid rgba(148,163,184,.24);
        text-align:center;
      }

      .rigo-dashboard-debug-item:last-child{
        border-right:none;
      }

      .rigo-dashboard-debug-item span{
        display:block;
        margin-bottom:6px;
        overflow:hidden;
        color:#e2e8f0;
        font-size:
          clamp(
            9px,
            .75vw,
            11px
          );
        line-height:1.2;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-dashboard-debug-item strong{
        display:block;
        font-size:
          clamp(
            18px,
            1.65vw,
            24px
          );
        line-height:1;
        font-weight:800;
      }

      .rigo-dashboard-debug-item.red strong{
        color:#fb7185;
      }

      .rigo-dashboard-debug-item.yellow strong{
        color:#facc15;
      }

      .rigo-dashboard-debug-item.purple strong{
        color:#c084fc;
      }

      .rigo-dashboard-debug-item.blue strong{
        color:#38bdf8;
      }

      .rigo-dashboard-debug-item.green strong{
        color:#a3e635;
      }


      /* =================================
         FOOTER
      ================================= */

      .rigo-dashboard-footer{
        min-width:0;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:5px;
        padding-top:10px;
        overflow:hidden;
        color:#94a3b8;
        font-size:10px;
        line-height:1;
        white-space:nowrap;
      }

      .rigo-dashboard-footer-separator{
        color:#475569;
      }

      .rigo-dashboard-footer-time{
        margin-left:auto;
        overflow:hidden;
        color:#64748b;
        text-overflow:ellipsis;
      }


      /* =================================
         COMPACT LAPTOP HEIGHT
      ================================= */

      @media(
        min-width:981px
      ) and (
        max-height:800px
      ){

        .rigo-dashboard-page{
          padding:13px 16px;
        }

        .rigo-dashboard-header{
          gap:9px;
          margin-bottom:10px;
        }

        .rigo-dashboard-header h1{
          margin-bottom:3px;
          font-size:27px;
        }

        .rigo-dashboard-header p{
          font-size:11px;
        }

        .rigo-dashboard-button{
          min-height:31px;
          padding:0 12px;
          font-size:11px;
        }

        .rigo-dashboard-content{
          grid-template-rows:
            88px
            minmax(180px,1fr)
            100px;
          gap:10px;
        }

        .rigo-dashboard-metrics,
        .rigo-dashboard-panels{
          gap:10px;
        }

        .rigo-dashboard-metric-card{
          padding:10px 11px 15px;
        }

        .rigo-dashboard-widget{
          padding:11px 13px;
        }

        .rigo-dashboard-status-list{
          gap:8px;
        }

        .rigo-dashboard-footer{
          padding-top:7px;
        }

      }


      /* =================================
         NARROW DESKTOP
      ================================= */

      @media(
        min-width:981px
      ) and (
        max-width:1250px
      ){

        .rigo-dashboard-metric-main{
          gap:7px;
        }

        .rigo-dashboard-metric-icon{
          width:33px;
          height:33px;
          font-size:19px;
        }

        .rigo-dashboard-metric-value strong{
          font-size:20px;
        }

        .rigo-dashboard-metric-value span{
          font-size:9px;
        }

        .rigo-dashboard-widget{
          padding-left:11px;
          padding-right:11px;
        }

        .rigo-dashboard-status-row{
          gap:8px;
        }

      }


      /* =================================
         TABLET
      ================================= */

      @media(max-width:980px){

        .rigo-dashboard-page{
          height:auto;
          min-height:100%;
          display:block;
          overflow-y:auto;
        }

        .rigo-dashboard-main{
          overflow:visible;
        }

        .rigo-dashboard-content{
          height:auto;
          display:flex;
          flex-direction:column;
          overflow:visible;
        }

        .rigo-dashboard-metrics{
          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );
        }

        .rigo-dashboard-metric-card{
          min-height:94px;
        }

        .rigo-dashboard-panels{
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
          overflow:visible;
        }

        .rigo-dashboard-widget{
          min-height:220px;
        }

        .rigo-dashboard-panels
        .rigo-dashboard-widget:last-child{
          grid-column:1 / -1;
        }

        .rigo-dashboard-debug{
          min-height:115px;
        }

        .rigo-dashboard-footer{
          margin-top:12px;
        }

      }


      /* =================================
         MOBILE
      ================================= */

      @media(max-width:680px){

        .rigo-dashboard-page{
          min-height:100%;
          padding:12px 12px 20px;
          overflow-y:auto;
          -webkit-overflow-scrolling:touch;
        }

        .rigo-dashboard-header,
        .rigo-dashboard-footer,
        .rigo-dashboard-content{
          display:none;
        }

        .rigo-dashboard-mobile-control{
          display:flex;
          flex-direction:column;
          gap:12px;
        }

        .rigo-mobile-control-card{
          overflow:hidden;
          border:1px solid rgba(94,126,163,.25);
          border-radius:16px;
          background:linear-gradient(145deg,rgba(11,27,47,.98),rgba(6,17,31,.98));
          box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 12px 30px rgba(0,0,0,.18);
        }

        .rigo-mobile-health{
          display:grid;
          grid-template-columns:118px minmax(0,1fr);
          align-items:center;
          gap:12px;
          padding:16px;
        }

        .rigo-mobile-health-ring{
          --health-score:100;
          width:106px;
          height:106px;
          display:grid;
          place-items:center;
          border-radius:50%;
          background:conic-gradient(var(--rigo-primary) calc(var(--health-score) * 1%),rgba(72,93,119,.22) 0);
          box-shadow:0 0 24px rgba(0,230,157,.12);
        }

        .rigo-mobile-health-ring::before{
          content:"";
          grid-area:1 / 1;
          width:84px;
          height:84px;
          border-radius:50%;
          background:#071321;
        }

        .rigo-mobile-health-score{
          z-index:1;
          grid-area:1 / 1;
          text-align:center;
        }

        .rigo-mobile-health-score strong{
          display:block;
          font-size:29px;
          line-height:1;
        }

        .rigo-mobile-health-score span{
          display:block;
          margin-top:4px;
          color:#9fb0c4;
          font-size:9px;
        }

        .rigo-mobile-health-copy h2{
          margin:0 0 9px;
          font-size:18px;
        }

        .rigo-mobile-health-copy p{
          margin:0 0 10px;
          color:#aebccd;
          font-size:11px;
          line-height:1.45;
        }

        .rigo-mobile-health-line{
          display:flex;
          align-items:center;
          gap:7px;
          margin-top:7px;
          color:#d8e0ea;
          font-size:10px;
        }

        .rigo-mobile-health-line i{
          width:7px;
          height:7px;
          border-radius:50%;
          background:var(--rigo-primary);
          box-shadow:0 0 8px rgba(0,230,157,.35);
        }

        .rigo-mobile-section-title{
          margin:2px 2px -2px;
          color:#e7edf5;
          font-size:13px;
          font-weight:800;
        }

        .rigo-mobile-quick-actions{
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:7px;
        }

        .rigo-mobile-quick-action{
          min-width:0;
          min-height:72px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:7px;
          padding:8px 3px;
          border:1px solid rgba(94,126,163,.22);
          border-radius:13px;
          color:#e7edf5;
          background:linear-gradient(180deg,rgba(13,31,51,.96),rgba(7,20,35,.96));
          font:700 9px/1.2 inherit;
          text-align:center;
          text-decoration:none;
        }

        .rigo-mobile-quick-action span{
          color:var(--action-color,var(--rigo-primary));
          font-size:24px;
          line-height:1;
        }

        .rigo-mobile-status-list{
          padding:0 14px;
        }

        .rigo-mobile-status-item{
          min-height:54px;
          display:grid;
          grid-template-columns:28px minmax(0,1fr) auto;
          align-items:center;
          gap:10px;
          border-bottom:1px solid rgba(94,126,163,.14);
        }

        .rigo-mobile-status-item:last-child{
          border-bottom:0;
        }

        .rigo-mobile-status-icon{
          color:var(--status-color,var(--rigo-primary));
          font-size:19px;
          text-align:center;
        }

        .rigo-mobile-status-copy strong{
          display:block;
          font-size:12px;
        }

        .rigo-mobile-status-copy small{
          display:block;
          margin-top:2px;
          overflow:hidden;
          color:#8fa0b5;
          font-size:9px;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .rigo-mobile-status-result{
          max-width:94px;
          overflow:hidden;
          color:var(--rigo-primary);
          font-size:10px;
          font-weight:800;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .rigo-mobile-status-result.danger{
          color:var(--rigo-red);
        }

        .rigo-mobile-metrics{
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:7px;
        }

        .rigo-mobile-metric{
          min-width:0;
          padding:12px 8px;
          border:1px solid rgba(94,126,163,.18);
          border-radius:12px;
          background:rgba(8,22,38,.82);
        }

        .rigo-mobile-metric strong{
          display:block;
          overflow:hidden;
          font-size:18px;
          text-overflow:ellipsis;
        }

        .rigo-mobile-metric span{
          display:block;
          margin-top:4px;
          color:#93a4b8;
          font-size:8px;
        }

        .rigo-mobile-primary-action{
          width:100%;
          min-height:48px;
          border:1px solid rgba(0,230,157,.35);
          border-radius:13px;
          color:#02130d;
          background:linear-gradient(135deg,#20e6a0,#00bc78);
          font:800 13px/1 inherit;
        }

        .rigo-dashboard-header h1{
          font-size:25px;
        }

        .rigo-dashboard-header p{
          max-width:100%;
          font-size:11px;
        }

        .rigo-dashboard-actions{
          width:100%;
        }

        .rigo-dashboard-button{
          flex:1;
        }

        .rigo-dashboard-metrics{
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
        }

        .rigo-dashboard-panels{
          grid-template-columns:1fr;
        }

        .rigo-dashboard-panels
        .rigo-dashboard-widget:last-child{
          grid-column:auto;
        }

        .rigo-dashboard-debug-grid{
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
          row-gap:18px;
        }

        .rigo-dashboard-debug-item{
          border-right:none;
        }

        .rigo-dashboard-footer{
          justify-content:flex-start;
          flex-wrap:wrap;
          line-height:1.4;
          white-space:normal;
        }

        .rigo-dashboard-footer-time{
          width:100%;
          margin-left:0;
        }

      }


      @media(max-width:420px){

        .rigo-dashboard-metrics{
          grid-template-columns:1fr;
        }

      }

    </style>
  `;

}



// =====================================
// STATUS ROW
// =====================================

function createStatusRow(
  label,
  value,
  status = "muted",
  options = {}
){

  const dot =
  options.dot
  ? `
    <span
      class="rigo-dashboard-status-dot"
      aria-hidden="true"
    ></span>
  `
  : "";

  return `
    <div class="rigo-dashboard-status-row">

      <span>
        ${escapeHTML(label)}
      </span>

      <strong
        class="
          rigo-dashboard-status-value
          ${escapeHTML(status)}
        "
        title="${escapeHTML(value)}"
      >
        ${dot}${escapeHTML(value)}
      </strong>

    </div>
  `;

}



// =====================================
// METRIC CARD
// =====================================

function createMetricCard(
  options = {}
){

  const value =
  options.raw === true
  ? escapeHTML(
      options.value
    )
  : formatNumber(
      options.value
    );

  return `
    <article
      class="rigo-dashboard-metric-card"
      style="
        --metric-color:
        ${escapeHTML(options.color || "#38bdf8")};
      "
      data-metric="${escapeHTML(options.id || "")}"
    >

      <div class="rigo-dashboard-metric-main">

        <div
          class="rigo-dashboard-metric-icon"
          aria-hidden="true"
        >
          ${options.icon || "◈"}
        </div>

        <div class="rigo-dashboard-metric-value">

          <strong title="${value}">
            ${value}
          </strong>

          <span>
            ${escapeHTML(options.label || "")}
          </span>

        </div>

      </div>

      <div
        class="rigo-dashboard-metric-line"
        aria-hidden="true"
      ></div>

    </article>
  `;

}



// =====================================
// BASE WIDGET
// =====================================

function createWidget(
  options = {}
){

  return `
    <section
      class="
        rigo-dashboard-widget
        ${escapeHTML(options.className || "")}
      "
      data-widget="${escapeHTML(options.id || "")}"
    >

      <div class="rigo-dashboard-widget-header">

        <span
          class="rigo-dashboard-widget-icon"
          aria-hidden="true"
        >
          ${options.icon || ""}
        </span>

        <div class="rigo-dashboard-widget-title">

          <h3>
            ${escapeHTML(options.title || "Widget")}
          </h3>

          ${
            options.subtitle
            ? `
              <p>
                ${escapeHTML(options.subtitle)}
              </p>
            `
            : ""
          }

        </div>

      </div>

      <div class="rigo-dashboard-widget-body">
        ${options.body || ""}
      </div>

    </section>
  `;

}



// =====================================
// METRICS
// =====================================

function renderMetricCards(
  data = {}
){

  const memory =
  data.memory || {};

  const memoryValue =
  memory.available
  ? (
    memory.usage ??
    memory.entries ??
    0
  )
  : "N/A";

  return `
    <div class="rigo-dashboard-metrics">

      ${createMetricCard({
        id:"files",
        icon:"▰",
        label:"Files",
        value:data.files,
        color:"#249cff"
      })}

      ${createMetricCard({
        id:"folders",
        icon:"▰",
        label:"Folders",
        value:data.folders,
        color:"#facc15"
      })}

      ${createMetricCard({
        id:"systems",
        icon:"▣",
        label:"Systems",
        value:data.systems,
        color:"#a855f7"
      })}

      ${createMetricCard({
        id:"agents",
        icon:"✹",
        label:"Agents",
        value:data.agents,
        color:"#ec4899"
      })}

      ${createMetricCard({
        id:"imports",
        icon:"</>",
        label:"Code Imports",
        value:data.imports,
        color:"#84cc16"
      })}

      ${createMetricCard({
        id:"memory",
        icon:"◉",
        label:"Memory",
        value:memoryValue,
        raw:true,
        color:"#0ea5e9"
      })}

    </div>
  `;

}



// =====================================
// PROJECT OVERVIEW
// =====================================

function createProjectOverviewWidget(
  data = {}
){

  const project =
  data.project || {};

  const projectName =
  project.name ||
  project.fullName ||
  project.full_name ||
  "RIGO AI";

  const projectPath =
  project.path ||
  project.root ||
  "/";

  const indexStatus =
  project.indexStatus ||
  project.status ||
  (
    Number(data.files) > 0
    ? "indexed"
    : "not-indexed"
  );

  return createWidget({

    id:
    "project-overview",

    icon:
    "▤",

    title:
    "Project Overview",

    subtitle:
    "Project index and repository overview.",

    body:
    `
      <div class="rigo-dashboard-status-list">

        ${createStatusRow(
          "Project Name",
          projectName,
          "muted"
        )}

        ${createStatusRow(
          "Project Path",
          projectPath,
          "muted"
        )}

        ${createStatusRow(
          "Index Status",
          formatStatus(indexStatus),
          getStatusClass(indexStatus),
          {
            dot:true
          }
        )}

        ${createStatusRow(
          "Last Updated",
          formatDateTime(
            project.updatedAt ||
            data.lastUpdatedAt
          ),
          "muted"
        )}

      </div>
    `

  });

}



// =====================================
// GITHUB
// =====================================

function createGitHubWidget(
  data = {}
){

  const github =
  data.github || {};

  const status =
  github.status ||
  github.connection ||
  "waiting-for-scan";

  return createWidget({

    id:
    "github-status",

    icon:
    "●",

    title:
    "GitHub Status",

    subtitle:
    "Repository provider connection.",

    body:
    `
      <div class="rigo-dashboard-status-list">

        ${createStatusRow(
          "Provider",
          github.provider ||
          "GitHub",
          "muted"
        )}

        ${createStatusRow(
          "Connection",
          formatStatus(status),
          getStatusClass(status)
        )}

        ${createStatusRow(
          "Connected",
          getBooleanLabel(
            github.connected
          ),
          github.connected
          ? "success"
          : "danger"
        )}

        ${createStatusRow(
          "Repository",
          github.repository ||
          github.repo ||
          "-",
          "muted"
        )}

        ${createStatusRow(
          "Last Scan",
          formatDateTime(
            github.lastScanAt
          ),
          "muted"
        )}

      </div>
    `

  });

}



// =====================================
// MEMORY
// =====================================

function createMemoryWidget(
  data = {}
){

  const memory =
  data.memory || {};

  const status =
  memory.status ||
  (
    memory.available
    ? "available"
    : "missing"
  );

  return createWidget({

    id:
    "memory-status",

    icon:
    "◉",

    title:
    "Memory Status",

    subtitle:
    "Memory subsystem availability.",

    body:
    `
      <div class="rigo-dashboard-status-list">

        ${createStatusRow(
          "Status",
          formatStatus(status),
          getStatusClass(status)
        )}

        ${createStatusRow(
          "Available",
          getBooleanLabel(
            memory.available
          ),
          memory.available
          ? "success"
          : "danger"
        )}

        ${createStatusRow(
          "Last Sync",
          formatDateTime(
            memory.lastSyncAt
          ),
          "muted"
        )}

        ${createStatusRow(
          "Usage",
          memory.usage ??
          memory.entries ??
          "-",
          "muted"
        )}

      </div>
    `

  });

}



// =====================================
// DEBUG
// =====================================

function createDebugWidget(
  data = {}
){

  const debug =
  data.debug || {};

  return createWidget({

    id:
    "debug-status",

    className:
    "rigo-dashboard-debug",

    icon:
    "◉",

    title:
    "Debug Status",

    subtitle:
    "Runtime and system debug overview.",

    body:
    `
      <div class="rigo-dashboard-debug-grid">

        <div class="rigo-dashboard-debug-item red">
          <span>Runtime Errors</span>

          <strong>
            ${formatNumber(
              debug.runtimeErrors
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item red">
          <span>Console Errors</span>

          <strong>
            ${formatNumber(
              debug.consoleErrors
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item yellow">
          <span>Warnings</span>

          <strong>
            ${formatNumber(
              debug.warnings
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item purple">
          <span>Memory Issues</span>

          <strong>
            ${formatNumber(
              debug.memoryIssues
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item blue">
          <span>Performance Issues</span>

          <strong>
            ${formatNumber(
              debug.performanceIssues
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item green">
          <span>Network Issues</span>

          <strong>
            ${formatNumber(
              debug.networkIssues
            )}
          </strong>
        </div>

      </div>
    `

  });

}



function renderMobileControlCenter(
  data = {}
){

  const debug = data.debug || {};
  const runtimeErrors = Number(debug.runtimeErrors || 0) + Number(debug.consoleErrors || 0);
  const github = data.github || {};
  const memory = data.memory || {};
  const healthScore = Math.max(0,100 - Math.min(60,runtimeErrors * 12) - (github.connected ? 0 : 12) - (memory.available ? 0 : 8));
  const healthLabel = healthScore >= 90 ? "Excellent" : healthScore >= 75 ? "Stable" : "Needs attention";

  return `
    <div class="rigo-dashboard-mobile-control">

      <section class="rigo-mobile-control-card rigo-mobile-health">
        <div class="rigo-mobile-health-ring" style="--health-score:${healthScore}">
          <div class="rigo-mobile-health-score">
            <strong>${healthScore}</strong>
            <span>${escapeHTML(healthLabel)}</span>
          </div>
        </div>
        <div class="rigo-mobile-health-copy">
          <h2>System Health</h2>
          <p>Live project, memory, provider, and runtime overview.</p>
          <div class="rigo-mobile-health-line"><i></i><span>${runtimeErrors ? `${runtimeErrors} runtime errors` : "Runtime clear"}</span></div>
          <div class="rigo-mobile-health-line"><i></i><span>${memory.available ? "Memory available" : "Memory unavailable"}</span></div>
        </div>
      </section>

      <div class="rigo-mobile-section-title">Quick Actions</div>
      <div class="rigo-mobile-quick-actions">
        <button type="button" class="rigo-mobile-quick-action" data-dashboard-action="scan-project"><span>⌕</span>Scan</button>
        <a class="rigo-mobile-quick-action" href="#studio/admin-agent" style="--action-color:var(--rigo-purple)"><span>✦</span>Agents</a>
        <a class="rigo-mobile-quick-action" href="#studio/debug" style="--action-color:var(--rigo-red)"><span>⌁</span>Debug</a>
        <button type="button" class="rigo-mobile-quick-action" data-dashboard-action="refresh" style="--action-color:var(--rigo-blue)"><span>↻</span>Refresh</button>
      </div>

      <div class="rigo-mobile-section-title">Status</div>
      <section class="rigo-mobile-control-card rigo-mobile-status-list">
        <div class="rigo-mobile-status-item">
          <span class="rigo-mobile-status-icon" style="--status-color:#f8fafc">●</span>
          <div class="rigo-mobile-status-copy"><strong>GitHub</strong><small>${escapeHTML(github.repository || github.repo || "Repository provider")}</small></div>
          <span class="rigo-mobile-status-result ${github.connected ? "" : "danger"}">${github.connected ? "Connected" : formatStatus(github.status)}</span>
        </div>
        <div class="rigo-mobile-status-item">
          <span class="rigo-mobile-status-icon" style="--status-color:var(--rigo-cyan)">◉</span>
          <div class="rigo-mobile-status-copy"><strong>Memory</strong><small>Memory subsystem</small></div>
          <span class="rigo-mobile-status-result ${memory.available ? "" : "danger"}">${memory.available ? "Available" : "Unavailable"}</span>
        </div>
        <div class="rigo-mobile-status-item">
          <span class="rigo-mobile-status-icon" style="--status-color:var(--rigo-red)">⌁</span>
          <div class="rigo-mobile-status-copy"><strong>Debug</strong><small>Runtime and console</small></div>
          <span class="rigo-mobile-status-result ${runtimeErrors ? "danger" : ""}">${runtimeErrors} errors</span>
        </div>
      </section>

      <div class="rigo-mobile-section-title">Project</div>
      <div class="rigo-mobile-metrics">
        <div class="rigo-mobile-metric"><strong>${formatNumber(data.files)}</strong><span>Files</span></div>
        <div class="rigo-mobile-metric"><strong>${formatNumber(data.folders)}</strong><span>Folders</span></div>
        <div class="rigo-mobile-metric"><strong>${formatNumber(data.systems)}</strong><span>Systems</span></div>
        <div class="rigo-mobile-metric"><strong>${formatNumber(data.agents)}</strong><span>Agents</span></div>
      </div>

      <button type="button" class="rigo-mobile-primary-action" data-dashboard-action="scan-project">Scan Project</button>

    </div>
  `;

}



// =====================================
// RENDER
// =====================================

function renderWidgets(
  data = {}
){

  return `
    ${renderDashboardStyles()}

    ${renderMobileControlCenter(data)}

    <div class="rigo-dashboard-content">

      ${renderMetricCards(data)}

      <div class="rigo-dashboard-panels">

        ${createProjectOverviewWidget(data)}

        ${createGitHubWidget(data)}

        ${createMemoryWidget(data)}

      </div>

      ${createDebugWidget(data)}

    </div>
  `;

}



// =====================================
// LEGACY HELPERS
// =====================================

function createMetric(
  label,
  value,
  hint = ""
){

  return `
    <div class="rigo-dashboard-status-row">

      <span>
        ${escapeHTML(label)}
      </span>

      <strong class="rigo-dashboard-status-value">

        ${formatNumber(value)}

        ${
          hint
          ? `
            <small>
              ${escapeHTML(hint)}
            </small>
          `
          : ""
        }

      </strong>

    </div>
  `;

}



function createStatusPill(
  status
){

  const normalized =
  String(
    status || "unknown"
  );

  return `
    <strong
      class="
        rigo-dashboard-status-value
        ${getStatusClass(normalized)}
      "
    >
      ${escapeHTML(
        formatStatus(normalized)
      )}
    </strong>
  `;

}



function createCodeMapWidget(
  data = {}
){

  return createWidget({

    id:
    "code-map",

    icon:
    "</>",

    title:
    "Code Map",

    subtitle:
    "Imports, exports, and relationships.",

    body:
    `
      <div class="rigo-dashboard-status-list">

        ${createStatusRow(
          "Imports",
          formatNumber(
            data.imports
          )
        )}

        ${createStatusRow(
          "Exports",
          formatNumber(
            data.exports
          )
        )}

        ${createStatusRow(
          "Relationships",
          formatNumber(
            data.relationships
          )
        )}

      </div>
    `

  });

}



function createActivityWidget(){

  return createWidget({

    id:
    "recent-activity",

    icon:
    "◷",

    title:
    "Recent Activity",

    subtitle:
    "Studio activity stream.",

    body:
    `
      <div class="rigo-dashboard-status-value muted">
        No activity events loaded yet.
      </div>
    `

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  escapeHTML,

  formatNumber,

  formatStatus,

  renderDashboardStyles,

  createWidget,

  createMetric,

  createMetricCard,

  createStatusPill,

  createStatusRow,

  createProjectOverviewWidget,

  createCodeMapWidget,

  createGitHubWidget,

  createMemoryWidget,

  createDebugWidget,

  createActivityWidget,

  renderMetricCards,

  renderWidgets

};

export default
renderWidgets;

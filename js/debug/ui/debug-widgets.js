// =====================================
// RIGO AI
// DEBUG WIDGETS
// =====================================

const WidgetColors =
Object.freeze({

  SUCCESS:
  "#22c55e",

  WARNING:
  "#facc15",

  ERROR:
  "#ef4444",

  INFO:
  "#3b82f6"

});



// =====================================
// HEALTH WIDGET
// =====================================

function createHealthWidget(

  score = 100

){

  let color =

    WidgetColors
    .SUCCESS;

  if(
    score < 90
  ){

    color =
    WidgetColors
    .WARNING;

  }

  if(
    score < 70
  ){

    color =
    WidgetColors
    .ERROR;

  }

  return `

<div
style="
padding:12px;
border-radius:8px;
background:${color};
color:white;
font-weight:bold;
">

Health Score:
${score}%

</div>

`;

}



// =====================================
// METRIC WIDGET
// =====================================

function createMetricWidget({

  title = "",

  value = ""

} = {}){

  return `

<div
style="
padding:12px;
border:1px solid #374151;
border-radius:8px;
">

<div>

${title}

</div>

<h3>

${value}

</h3>

</div>

`;

}



// =====================================
// API
// =====================================

export const DebugWidgets =
Object.freeze({

  health:
  createHealthWidget,

  metric:
  createMetricWidget

});



export default
DebugWidgets;

// =====================================
// RIGO AI
// DEBUG TABLE
// =====================================

function escapeHtml(
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
  );

}



// =====================================
// CREATE TABLE
// =====================================

function createTable({

  columns = [],

  rows = []

} = {}){

  const header =

    columns

    .map(column => `

<th>

${escapeHtml(
  column
)}

</th>

`)

    .join("");



  const body =

    rows

    .map(row => `

<tr>

${columns

.map(column => `

<td>

${escapeHtml(

  row?.[
    column
  ]

)}

</td>

`)

.join("")}

</tr>

`)

    .join("");



  return `

<table
class="rigo-debug-table"
style="
width:100%;
border-collapse:collapse;
font-size:12px;
">

<thead>

<tr>

${header}

</tr>

</thead>

<tbody>

${body}

</tbody>

</table>

`;

}



// =====================================
// API
// =====================================

export const DebugTable =
Object.freeze({

  create:
  createTable

});



export default
DebugTable;

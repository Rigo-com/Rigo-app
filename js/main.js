try {

  await import("./bootstrap/index.js");

  document.body.innerHTML = `
    <h1 style="color:green">
      SUCCESS
    </h1>
  `;

}
catch(error){

  document.body.innerHTML = `
<pre style="
white-space:pre-wrap;
padding:20px;
color:red;
font-size:14px;
">
TYPE:
${typeof error}

MESSAGE:
${error?.message}

STACK:
${error?.stack}

STRING:
${String(error)}
</pre>
`;

}

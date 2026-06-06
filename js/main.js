try {

  await import("./bootstrap/index.js");

  document.body.innerHTML = "OK";

}
catch(error){

  document.body.innerHTML = `
<pre>
${error.stack}
</pre>
`;

}

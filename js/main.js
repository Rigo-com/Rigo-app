try {

  const module =
  await import("./bootstrap/index.js");

  document.body.innerHTML = `
    <h1 style="color:green">
      IMPORT SUCCESS
    </h1>
  `;

} catch (error) {

  document.body.innerHTML = `
    <pre style="
      color:red;
      padding:20px;
      white-space:pre-wrap;
    ">
${error.stack || error.message || error}
    </pre>
  `;

}

(() => {

const checks = {
  createElement: false,
  setRootElement: false,
  registerUiElements: false,
  bootstrapUi: false,
  initializeUi: false
};

for (const key in window) {

  try {

    const obj = window[key];

    if (
      typeof obj !== "function" &&
      typeof obj !== "object"
    ) continue;

    const text = String(obj);

    Object.keys(checks)
      .forEach(name => {

        if (
          text.includes(name)
        ) {
          checks[name] = true;
        }

      });

  } catch {}

}

document.body.innerHTML =
`<pre>${JSON.stringify(checks,null,2)}</pre>`;

})();

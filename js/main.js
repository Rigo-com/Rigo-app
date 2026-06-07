(() => {

const matches = [];

for (const key in window) {

  try {

    const obj = window[key];

    if (
      typeof obj !== "object" &&
      typeof obj !== "function"
    ) continue;

    const props =
      Object.getOwnPropertyNames(obj);

    props.forEach(prop => {

      if (
        prop.includes("Root") ||
        prop.includes("root") ||
        prop.includes("Element") ||
        prop.includes("element")
      ) {

        matches.push({
          object: key,
          property: prop
        });

      }

    });

  } catch {}

}

document.body.innerHTML =
`<pre>${JSON.stringify(matches,null,2)}</pre>`;

})();

// =====================================
// RIGO AI
// CHAT MARKDOWN RENDERER
// =====================================



// =====================================
// MARKDOWN STATE
// =====================================

const markdownRendererState =
Object.seal({

  initialized:true,

  rendering:false,

  parsing:false,

  sanitizing:false,

  diagnostics:Object.seal({

    renders:0,

    codeBlocks:0,

    inlineCode:0,

    sanitized:0,

    failed:0

  })

});



// =====================================
// SAFE CLONE
// =====================================

function safeMarkdownClone(
  value
){

  try{

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// ESCAPE HTML
// =====================================

function escapeMarkdownHTML(
  value
){

  return String(
    value || ""
  )

  .replace(
    /&/g,
    "&amp;"
  )

  .replace(
    /</g,
    "&lt;"
  )

  .replace(
    />/g,
    "&gt;"
  )

  .replace(
    /"/g,
    "&quot;"
  )

  .replace(
    /'/g,
    "&#39;"
  );

}



// =====================================
// SANITIZE HTML
// =====================================

function sanitizeMarkdownHTML(
  html
){

  if(
    typeof html !==
    "string"
  ){

    return "";

  }

  markdownRendererState
  .sanitizing =
  true;

  try{

    const sanitized =
    html

    .replace(

      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,

      ""

    )

    .replace(

      /on\w+="[^"]*"/gi,

      ""

    )

    .replace(

      /javascript:/gi,

      ""

    )

    .replace(

      /data:text\/html/gi,

      ""

    );

    markdownRendererState
    .diagnostics
    .sanitized++;

    return sanitized;

  }

  finally{

    markdownRendererState
    .sanitizing =
    false;

  }

}



// =====================================
// INLINE CODE
// =====================================

function renderInlineMarkdown(
  content
){

  return content.replace(

    /`([^`]+)`/g,

    (_,code) => {

      markdownRendererState
      .diagnostics
      .inlineCode++;

      return (

        "<code>" +

        escapeMarkdownHTML(
          code
        )

        +

        "</code>"

      );

    }

  );

}



// =====================================
// CODE BLOCKS
// =====================================

function renderMarkdownCodeBlocks(
  content
){

  return content.replace(

    /```(\w+)?\n?([\s\S]*?)```/g,

    (_,language,code) => {

      markdownRendererState
      .diagnostics
      .codeBlocks++;

      const safeLanguage =
      escapeMarkdownHTML(
        language || "text"
      );

      const safeCode =
      escapeMarkdownHTML(
        code
      );

      return (

        '<pre class="code-block">' +

        '<div class="code-header">' +

        safeLanguage +

        "</div>" +

        '<code class="language-' +

        safeLanguage +

        '">' +

        safeCode +

        "</code>" +

        "</pre>"

      );

    }

  );

}



// =====================================
// HEADINGS
// =====================================

function renderMarkdownHeadings(
  content
){

  return content

  .replace(
    /^### (.*)$/gm,
    "<h3>$1</h3>"
  )

  .replace(
    /^## (.*)$/gm,
    "<h2>$1</h2>"
  )

  .replace(
    /^# (.*)$/gm,
    "<h1>$1</h1>"
  );

}



// =====================================
// BOLD
// =====================================

function renderMarkdownBold(
  content
){

  return content.replace(

    /\*\*(.*?)\*\*/g,

    "<strong>$1</strong>"

  );

}



// =====================================
// ITALIC
// =====================================

function renderMarkdownItalic(
  content
){

  return content.replace(

    /(^|[^*])\*(?!\*)(.*?)\*(?!\*)/g,

    "$1<em>$2</em>"

  );

}



// =====================================
// LINKS
// =====================================

function renderMarkdownLinks(
  content
){

  return content.replace(

    /$begin:math:display$\(\[\^$end:math:display$]+)\]$begin:math:text$\(https\?\:\\\/\\\/\[\^\\s\)\]\+\)$end:math:text$/g,

    (_,label,url) => {

      return (

        '<a href="' +

        escapeMarkdownHTML(
          url
        )

        +

        '" target="_blank" rel="noopener noreferrer">' +

        escapeMarkdownHTML(
          label
        )

        +

        "</a>"

      );

    }

  );

}



// =====================================
// LISTS
// =====================================

function renderMarkdownLists(
  content
){

  return content.replace(

    /(?:^|\n)(\- .+(?:\n\- .+)*)/g,

    (match) => {

      const items =

        match

        .trim()

        .split("\n")

        .map((item) => {

          return (

            "<li>" +

            item.replace(
              /^\- /,
              ""
            )

            +

            "</li>"

          );

        })

        .join("");

      return (

        "<ul>" +

        items +

        "</ul>"

      );

    }

  );

}



// =====================================
// PARAGRAPHS
// =====================================

function renderMarkdownParagraphs(
  content
){

  return content

  .split(
    /\n\s*\n/
  )

  .map((block) => {

    const trimmed =
    block.trim();

    if(
      !trimmed
    ){

      return "";

    }

    const isHTML =

      trimmed.startsWith(
        "<h"
      )

      ||

      trimmed.startsWith(
        "<pre"
      )

      ||

      trimmed.startsWith(
        "<ul"
      )

      ||

      trimmed.startsWith(
        "<li"
      )

      ||

      trimmed.startsWith(
        "<p"
      );

    if(
      isHTML
    ){

      return trimmed;

    }

    return (

      "<p>" +

      trimmed.replace(
        /\n/g,
        "<br>"
      )

      +

      "</p>"

    );

  })

  .join("");

}



// =====================================
// PARSE MARKDOWN
// =====================================

function parseMarkdown(
  content
){

  if(
    typeof content !==
    "string"
  ){

    return "";

  }

  markdownRendererState
  .parsing =
  true;

  try{

    let parsed =
    escapeMarkdownHTML(
      content
    );

    parsed =
    renderMarkdownCodeBlocks(
      parsed
    );

    parsed =
    renderInlineMarkdown(
      parsed
    );

    parsed =
    renderMarkdownHeadings(
      parsed
    );

    parsed =
    renderMarkdownBold(
      parsed
    );

    parsed =
    renderMarkdownItalic(
      parsed
    );

    parsed =
    renderMarkdownLinks(
      parsed
    );

    parsed =
    renderMarkdownLists(
      parsed
    );

    parsed =
    renderMarkdownParagraphs(
      parsed
    );

    parsed =
    sanitizeMarkdownHTML(
      parsed
    );

    return parsed;

  }

  catch(error){

    markdownRendererState
    .diagnostics
    .failed++;

    return escapeMarkdownHTML(
      content
    );

  }

  finally{

    markdownRendererState
    .parsing =
    false;

  }

}



// =====================================
// RENDER
// =====================================

function renderMarkdownContent(
  element,
  content
){

  if(
    !element
  ){

    return false;

  }

  markdownRendererState
  .rendering =
  true;

  try{

    element.innerHTML =

      parseMarkdown(
        content
      );

    markdownRendererState
    .diagnostics
    .renders++;

    return true;

  }

  catch(error){

    markdownRendererState
    .diagnostics
    .failed++;

    return false;

  }

  finally{

    markdownRendererState
    .rendering =
    false;

  }

}



// =====================================
// RESET
// =====================================

function resetMarkdownRenderer(){

  markdownRendererState
  .rendering =
  false;

  markdownRendererState
  .parsing =
  false;

  markdownRendererState
  .sanitizing =
  false;

  markdownRendererState
  .diagnostics
  .renders = 0;

  markdownRendererState
  .diagnostics
  .codeBlocks = 0;

  markdownRendererState
  .diagnostics
  .inlineCode = 0;

  markdownRendererState
  .diagnostics
  .sanitized = 0;

  markdownRendererState
  .diagnostics
  .failed = 0;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getMarkdownDiagnostics(){

  return Object.freeze({

    initialized:

      markdownRendererState
      .initialized,

    rendering:

      markdownRendererState
      .rendering,

    parsing:

      markdownRendererState
      .parsing,

    sanitizing:

      markdownRendererState
      .sanitizing,

    diagnostics:

      safeMarkdownClone(

        markdownRendererState
        .diagnostics

      )

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatMarkdownRenderer =
Object.freeze({

  parse:
  parseMarkdown,

  render:
  renderMarkdownContent,

  sanitize:
  sanitizeMarkdownHTML,

  reset:
  resetMarkdownRenderer,

  diagnostics:
  getMarkdownDiagnostics,

  snapshot:
  getMarkdownDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  ChatMarkdownRenderer,

  parseMarkdown,

  renderMarkdownContent,

  sanitizeMarkdownHTML,

  resetMarkdownRenderer,

  getMarkdownDiagnostics

};

export default
ChatMarkdownRenderer;

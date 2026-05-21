const chat =
document.getElementById("chat");

const input =
document.getElementById("input");

const sendBtn =
document.getElementById("sendBtn");

const langBtn =
document.getElementById("langBtn");

const subtitle =
document.getElementById("subtitle");

const sidebar =
document.getElementById("sidebar");

const chatHistory =
document.getElementById("chatHistory");

/* LANGUAGE */

let currentLanguage = "ar";

let currentChatTitle = "";

/* FIRST MESSAGE */

function showWelcome(){

  chat.innerHTML = `
  <div class="message ai">

  مرحباً 👋

  <br><br>

  أنا مساعدك الذكي الشخصي.
  كيف أقدر أساعدك اليوم؟

  </div>
  `;

}

showWelcome();

/* SIDEBAR */

function toggleSidebar(){

  sidebar.classList.toggle("active");

}

/* SAVE CHAT */

function saveChat(){

  localStorage.setItem(
    "rigo_current_chat",
    chat.innerHTML
  );

}

/* CREATE CHAT ITEM */

function createChatItem(title,content){

  const item =
  document.createElement("div");

  item.className =
  "chat-item";

  item.innerText = title;

  item.onclick = () => {

    chat.innerHTML = content;

    saveChat();

    sidebar.classList.remove(
      "active"
    );

  };

  chatHistory.prepend(item);

}

/* NEW CHAT */

function newChat(){

  const oldChat =
  chat.innerHTML;

  if(
    oldChat.trim() !== "" &&
    currentChatTitle !== ""
  ){

    createChatItem(
      currentChatTitle,
      oldChat
    );

  }

  currentChatTitle = "";

  showWelcome();

  saveChat();

}

/* ADD MESSAGE */

function addMessage(text,type){

  const message =
  document.createElement("div");

  message.className =
  "message " + type;

  message.innerText = text;

  chat.appendChild(message);

  chat.scrollTop =
  chat.scrollHeight;

  saveChat();

}

/* TYPING */

function showTyping(){

  const typing =
  document.createElement("div");

  typing.className =
  "message ai typing";

  typing.id = "typing";

  typing.innerText =
  currentLanguage === "ar"
  ? "RIGO AI يكتب..."
  : "RIGO AI is typing...";

  chat.appendChild(typing);

}

function removeTyping(){

  const typing =
  document.getElementById("typing");

  if(typing){

    typing.remove();

  }

}

/* AI */

function aiReply(userText){

  showTyping();

  setTimeout(() => {

    removeTyping();

    addMessage(
      currentLanguage === "ar"
      ? "فهمت عليك 👍"
      : "I understand 👍",
      "ai"
    );

  },700);

}

/* SEND */

function sendMessage(){

  const text =
  input.value.trim();

  if(text === "") return;

  if(currentChatTitle === ""){

    currentChatTitle =
    text.length > 30
    ? text.substring(0,30) + "..."
    : text;

  }

  addMessage(text,"user");

  input.value = "";

  aiReply(text);

}

sendBtn.addEventListener(
  "click",
  sendMessage
);

input.addEventListener(
  "keypress",
  function(e){

    if(e.key === "Enter"){

      sendMessage();

    }

  }
);

/* LANGUAGE */

function toggleLanguage(){

  if(currentLanguage === "ar"){

    currentLanguage = "en";

    document.documentElement.dir =
    "ltr";

    document.documentElement.lang =
    "en";

    langBtn.innerText = "AR";

    subtitle.innerText =
    "SMART PERSONAL ASSISTANT";

    input.placeholder =
    "Type your message here...";

    sendBtn.innerText =
    "Send";

  }

  else{

    currentLanguage = "ar";

    document.documentElement.dir =
    "rtl";

    document.documentElement.lang =
    "ar";

    langBtn.innerText = "EN";

    subtitle.innerText =
    "مساعد ذكي شخصي";

    input.placeholder =
    "اكتب رسالتك هنا...";

    sendBtn.innerText =
    "إرسال";

  }

}

/* LOAD SAVED CHAT */

const savedChat =
localStorage.getItem(
  "rigo_current_chat"
);

if(savedChat){

  chat.innerHTML = savedChat;

}

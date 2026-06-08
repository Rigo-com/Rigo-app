// =====================================
// RIGO AI
// WELCOME SCREEN
// =====================================

function createWelcomeScreen() {

  const app =
  document.getElementById(
    "app"
  );

  if (!app) {
    return false;
  }

  app.innerHTML =
  `
    <div class="welcome-screen">

      <div class="welcome-content">

        <img
          class="logo"
          src="./assets/rigo-logo.PNG"
          alt="RIGO AI">

        <h1>
          RIGO AI
        </h1>

        <p>
          AI Assistant For Everything
        </p>

        <button
          id="startButton">

          Start

        </button>

      </div>

    </div>
  `;

  return true;

}

export {
  createWelcomeScreen
};

export default
createWelcomeScreen;

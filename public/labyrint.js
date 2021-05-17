var initLabyrint = function () {
  if (!window.__antivaxKonspiraceLabyrintInitialized) {
    window.addEventListener("message", function (event) {
      if (
        event.data &&
        event.data.app === "antivax-konspirace-labyrint" &&
        event.data.type === "resize"
      ) {
        document
          .querySelectorAll(".antivax-konspirace-labyrint-iframe")
          .forEach((el) => {
            el.style.height = event.data.data.height + "px";
          });
      }
      window.__antivaxKonspiraceLabyrintInitialized = true;
    });
  }
};

document.addEventListener("DOMContentLoaded", initLabyrint);

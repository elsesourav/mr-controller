const canvas = document.getElementById("CANVAS");
const ctx = canvas.getContext("2d");

const scale = 4;
const W = 366 * scale;
const H = 200 * scale;
canvas.width = W;
canvas.height = H;


OPTIONS.addEventListener("input", (e) => {
   if (e.target === I("#status")[0]) {
      const RATIO_HEIGHT = (H / W);
      CONTAINER.style.height = `${CONTAINER.clientWidth * RATIO_HEIGHT}px`;
   } else {
      
   }
});
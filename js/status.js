const canvas = document.getElementById("CANVAS");
const ctx = canvas.getContext("2d");

const scale = 4;
const W = 366 * scale;
const H = 200 * scale;
canvas.width = W;
canvas.height = H;

const RATIO_HEIGHT = (H / W);
CONTAINER.style.height = `${CONTAINER.clientWidth * RATIO_HEIGHT}px`;

// const DATA = Array(700).fill(0);
// DATA[0] = 150;
// for (let i = 1; i < DATA.length; i++) {
//    DATA[i] = DATA[i - 1] + Math.floor(Math.random() * 155);
// }
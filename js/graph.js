class Graph {
   constructor(cvs, ctx) {
      this.cvs = cvs;
      this.ctx = ctx;
      this.width = cvs.width;
      this.height = cvs.height;
      this.isSelecting = false;
      this.selectionStart = 0;
      this.selectionEnd = 0;
      this.highlightedIndex = null;
      this.#addEventListeners();
   }

   setup(data) {
      this.totals = data.map(e => e.total);
      this.data = [...data];
      this.originalData = [...data];
      this.#drawGraph();
   }

   draw() {
      this.data = this.originalData;
      this.#drawGraph();
   }

   #drawGraph() {
      this.min = Math.min(...this.totals);
      this.max = Math.max(...this.totals);
      this.totalY = this.max - this.min;
      const extra = scale * 30;

      this.ctx.clearRect(0, 0, this.width, this.height);
      const stepX = (this.width / this.data.length);
      const ratio = this.height / (this.totalY || 1);

      for (let i = 0; i < this.data.length; i++) {
         const x = i * stepX;
         const dy = Math.floor(ratio * (this.totals[i] - this.min));
         const y = map(dy, 0, this.height, this.height - extra, extra);
         const color = this.#getColor(i);

         this.#drawStick(x, y, stepX, color, this.data[i]);
         if (i === this.highlightedIndex) {
            this.ctx.fillStyle = "#0ff3";
            this.ctx.fillRect(x, 0, stepX, this.height);
            this.ctx.strokeStyle = "black";
            this.ctx.strokeRect(x, 0, stepX, this.height);
         }
      }
   }

   #drawStick(x, y, thickness, color, dataValue) {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x, this.height);
      this.ctx.lineTo(x + thickness, this.height);
      this.ctx.lineTo(x + thickness, y);
      this.ctx.closePath();
      this.ctx.fill();
      if (thickness > scale * 3) {
         this.ctx.strokeStyle = "black";
         this.ctx.lineWidth = 2;
         this.ctx.stroke();
      }
      if (thickness > 30) {
         const { isActivitiesComplete, mobile, pc } = dataValue;

         let str = ` _ ${dataValue.total} _\n _ `;
         if (mobile?.progress) str += mobile.progress;
         if (pc?.progress) str += `+${pc.progress}`;
         if (isActivitiesComplete) str += `+E _ `;

         this.ctx.fillStyle = "white";
         this.ctx.font = `${thickness * 0.15}px Arial`;
         this.ctx.textAlign = "center";
         this.ctx.fillStyle = "black";

         const textWidth = this.ctx.measureText(str).width;
         const textHeight = parseInt(this.ctx.font);
         const textX = x + thickness / 2;
         const textY = this.height - 5;

         const lines = str.split('\n');
         const lineHeight = textHeight * 1;
         lines.forEach((line, index) => {
            const lineY = textY - (lines.length - 1 - index) * lineHeight;
            const lineWidth = this.ctx.measureText(line).width;
            this.ctx.fillRect(textX - lineWidth / 2, lineY - textHeight, lineWidth, textHeight);
            this.ctx.fillStyle = "white";
            this.ctx.fillText(line, textX, lineY);
            this.ctx.fillStyle = "black";
         });
      }
   }

   #getColor(index) {
      const { isActivitiesComplete, mobile, pc } = this.data[index];
      const eventPoint = 5;
      const event = isActivitiesComplete ? eventPoint : 0;

      const target = mobile.max + pc.max + eventPoint;
      const total = mobile.progress + pc.progress + event;

      if (target === total) {
         return "#0f0";
      } else if (target / 2 > total) {
         return "#f00";
      } else {
         return "#ff0";
      }
   }

   #addEventListeners() {
      const { left, width } = this.cvs.getBoundingClientRect();

      const startSelection = (event) => {
         this.isSelecting = true;
         const offsetX = event.touches ? event.touches[0].clientX : event.offsetX;
         this.selectionEnd = this.selectionStart = map(offsetX, left, width, 0, this.width);
      };

      const moveSelection = (event) => {
         if (this.isSelecting) {
            const offsetX = event.touches ? event.touches[0].clientX : event.offsetX;
            this.selectionEnd = map(offsetX, 0, width, 0, this.width);
            this.#drawSelection();
         }
      };

      const endSelection = () => {
         if (this.isSelecting) {
            this.isSelecting = false;
            this.#zoomToSelection();
         }
      };

      const showDataPoint = (event) => {
         const offsetX = event.touches ? event.touches[0].clientX : event.offsetX;
         const index = Math.floor(map(offsetX, 0, width, 0, this.data.length));
         this.highlightedIndex = index;
         this.#drawGraph();
         this.#showDataPointDiv(event, this.data[index]);
      };

      this.cvs.addEventListener("mousedown", startSelection);
      this.cvs.addEventListener("mousemove", moveSelection);
      this.cvs.addEventListener("mouseup", endSelection);
      this.cvs.addEventListener("mouseleave", (event) => {
         if (this.isSelecting) {
            endSelection(event);
         }
      });

      this.cvs.addEventListener("touchstart", startSelection);
      this.cvs.addEventListener("touchmove", moveSelection);
      this.cvs.addEventListener("touchend", endSelection);

      this.cvs.addEventListener("dblclick", () => {
         this.draw();
      });

      this.cvs.addEventListener("click", showDataPoint);
   }

   #drawSelection() {
      this.#drawGraph();
      this.ctx.fillStyle = "#00f3";
      const x = this.selectionStart;
      const width = this.selectionEnd - this.selectionStart;
      this.ctx.fillRect(x, 0, width, this.height);
   }

   #zoomToSelection() {
      const x = this.selectionStart;
      const width = this.selectionEnd - this.selectionStart;
      const offset = scale * 10;
      const DATA = [...this.data];

      const calculateSelection = (start, end) => {
         const selectedData = DATA.slice(start, end);
         if (selectedData.length > 2) {
            this.data = selectedData;
            this.#drawGraph();
         } else {
            this.#drawGraph();
         }
      };

      if (width > offset) {
         const start = Math.floor(x * DATA.length / this.width);
         const end = Math.floor((x + width) * DATA.length / this.width);
         calculateSelection(start, end);
      } else if (Math.abs(width) > offset) {
         const x = this.selectionEnd;
         const width = this.selectionStart - this.selectionEnd;
         const start = Math.floor(x * DATA.length / this.width);
         const end = Math.floor((x + width) * DATA.length / this.width);
         calculateSelection(start, end);
      } else {
         this.#drawGraph();
      }
   }

   #showDataPointDiv(event, dataValue) {
      const existingDiv = document.getElementById('data-point-div');
      if (existingDiv) {
         existingDiv.remove();
      }

      const div = document.createElement('div');
      div.id = 'data-point-div';
      Object.assign(div.style, {
         position: 'absolute',
         backgroundColor: 'white',
         border: '1px solid black',
         padding: '5px',
         zIndex: 1000,
         pointerEvents: 'none',
         userSelect: 'none',
         touchAction: 'none',
         fontFamily: 'system-ui'
      });
      div.innerText = `Points: ${dataValue}`;

      // Position the div at the click location
      const offsetX = event.touches ? event.touches[0].clientX : event.clientX;
      const offsetY = event.touches ? event.touches[0].clientY : event.clientY;
      div.style.left = `${offsetX}px`;
      div.style.top = `${offsetY}px`;

      // Append the div to the body
      document.body.appendChild(div);
   }
}
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
      this.isProfiles = false;
      this.range = "week";
      this.#addEventListeners();
   }

   setup(data, isProfiles = false) {
      this.isProfiles = isProfiles;
      this.originalData = [...data];
      let modifiedData = [...data];
      if (!isProfiles) {
         if (this.range === "week") {
            modifiedData = modifiedData.slice(-7);
         } else if (this.range === "month") {
            modifiedData = modifiedData.slice(-30);
         } else if (this.range === "year") {
            modifiedData = modifiedData.slice(-365);
         }
      } else {
         modifiedData.sort((a, b) => b.total - a.total);
      }
      this.data = modifiedData;
      this.totals = modifiedData.map(e => e.total);
      
      this.highlightedIndex = null;
      showGraphData.classList.remove("active");
      this.#drawGraph();
   }

   setRange(range) {
      this.range = range;
      this.setup(this.originalData, this.isProfiles);
   }

   draw() {
      this.setup(this.originalData, this.isProfiles);
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
         
         let str = ` _ ${dataValue.total} _\n _ `;
         if (this.isProfiles) {
            str += `${dataValue.name} _ `;
         } else {
            const { isActivitiesComplete, mobile, pc } = dataValue;
            if (mobile?.progress) str += mobile.progress;
            if (pc?.progress) str += `+${pc.progress}`;
            if (isActivitiesComplete) str += `+E _ `;
         }

         this.ctx.fillStyle = "white";
         this.ctx.font = `${Math.min(thickness * 0.15, 40)}px Arial`;
         this.ctx.textAlign = "center";
         this.ctx.fillStyle = "black";

         // const textWidth = this.ctx.measureText(str).width;
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
      if (this.isProfiles) {
         const deg = map(index, 0, this.data.length, 140, 0);
         return `hsl(${deg}, 100%, 50%)`;
      }
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
      
      const startSelection = (event) => {
         const { left, width } = this.cvs.getBoundingClientRect();
         this.isSelecting = true;
         const offsetX = event.touches ? event.touches[0].clientX : event.offsetX;
         this.selectionEnd = this.selectionStart = map(offsetX, left, width, 0, this.width);
      };
      
      const moveSelection = (event) => {
         const { width } = this.cvs.getBoundingClientRect();
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
         const { width } = this.cvs.getBoundingClientRect();
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

      addEventListener("scroll", () => {
         showGraphData.classList.remove("active");
      });
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
      
      showGraphData.classList.add("active");
      if (this.isProfiles) {
         const { name, total } = dataValue;
         showGraphData.innerHTML = `${name}: ${total}`;
      } else {
         const { total, date } = dataValue;
         showGraphData.innerHTML = `Points: ${total}<br>Date: ${date}`;
      }

      const offsetX = event.touches ? event.touches[0].clientX : event.clientX;
      const offsetY = event.touches ? event.touches[0].clientY : event.clientY;
      showGraphData.style.left = `${offsetX}px`;
      showGraphData.style.top = `${offsetY}px`;
   }
}
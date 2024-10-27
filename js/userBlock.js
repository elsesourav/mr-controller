class UserBlock {
   constructor(parent, name, adminName) {
      this.parent = parent;
      this.name = name;
      this.adminName = adminName;
      this.points = 0;
      this.tPoints = 0;
      this.userE = null;
      this.noE = null;
      this.pointE = null;
      this.tPointE = null;
      this.exeCloBtn = null;
      this.exeCloBtnText = "EXECUTE";
      this.#setup();
      this.#clickEventHandler();
   }

   #setup() {
      const { parent, name, points, tPoints, exeCloBtnText } = this;
      const no = parent.children.length + 1;

      this.userE = CE(
         { class: "user", onclick: `showSelected()` },
         CE({ tag: "input", class: "user-check", type: "checkbox" }),
         (this.noE = CE({ class: "no" }, no)),
         CE({ class: "name" }, name),
         CE(
            { class: "sbi-redeem point" },
            (this.pointE = CE({ tag: "span" }, points))
         ),
         CE(
            { class: "sbi-today today" },
            (this.tPointE = CE({ tag: "span" }, tPoints))
         ),
         CE({ tag: "i", class: "sbi-check" }),
         (this.exeCloBtn = CE({ class: "exe-clo" }, exeCloBtnText))
      );
   }

   clickAction() {
      asyncHandler(async () => {
         const { name } = this;

         if (this.exeCloBtn.textContent === "EXECUTE") {
            const oldLocation = await GET_REF(name).profileQueue.get();

            if (oldLocation.exists()) {
               await GET_REF(name).profileQueue.remove();
            }
            await GET_REF().pending.update({ [name]: Date.now() });
            hideFloatingWindow();
         } else {
            const snap = await GET_REF(name).profileProcess.get();

            if (snap.exists()) {
               await GET_REF().requests.update({ [name]: Date.now() });
            } else {
               await GET_REF(name).profilePending.remove();
               await GET_REF().queue.update({ [name]: Date.now() });
            }
            hideFloatingWindow();
         }
      });
   }

   #clickEventHandler() {
      this.exeCloBtn.addEventListener("click", () => {
         this.clickAction();
      });
   }

   connectDB() {
      asyncHandler(async () => {
         const { name } = this;

         await GET_REF(name).totalPoints.on("value", (snap) => {
            if (snap.exists()) {
               const value = snap.val();
               this.pointE.innerText = this.points = value || 0;
            }
         });

         await GET_REF(name).todayPoints.on("value", (snap) => {
            if (snap.exists()) {
               const { isActivitiesComplete, mobile, pc } = snap.val();
               let str = "";
               if (mobile?.progress) str += mobile.progress;
               if (pc?.progress) str += `+${pc.progress}`;
               if (isActivitiesComplete) str += `+E`;
               
               this.tPointE.innerText = this.tPoints = str;
            }
         });
      });
   }

   updateCompleteStatus(is = true) {
      this.userE.classList.toggle("complete", is);
   }

   updateRunningStatus(is = false) {
      this.userE.classList.toggle("running", is);
   }

   updateButtonText(btnText = this.exeCloBtnText) {
      this.exeCloBtn.innerText = this.exeCloBtnText = btnText;
   }

   updateParent(parent = this.parent) {
      this.parent = parent;

      if (this.parent === I("#normalUsers .scroll")[0]) {
         this.exeCloBtn.innerText = this.exeCloBtnText = "EXECUTE";
      } else {
         this.exeCloBtn.innerText = this.exeCloBtnText = "CLOSE";
      }

      this.noE.innerText = this.parent.children.length + 1;
      this.parent.append(this.userE);
   }

   setCallBack(callBack) {
      this.callBack = callBack;
   }
}

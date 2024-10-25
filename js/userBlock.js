class UserBlock {
   constructor(parent, username, adminName) {
      this.parent = parent;
      this.username = username;
      this.adminName = adminName;

      this.URL = {
         queue: `admins/${this.adminName}/execute/queue/`,
         pending: `admins/${this.adminName}/execute/pending/`,
         process: `admins/${this.adminName}/execute/process/`,
         request: `admins/${this.adminName}/execute/requests/`,
         point: `admins/${this.adminName}/usersPoints/`,
         queueUser: `admins/${this.adminName}/execute/queue/${this.username}/`,
         pendingUser: `admins/${this.adminName}/execute/pending/${this.username}/`,
         processUser: `admins/${this.adminName}/execute/process/${this.username}/`,
         requestUser: `admins/${this.adminName}/execute/requests/${this.username}/`,
         pointUser: `admins/${this.adminName}/usersPoints/${this.username}/`,
      };
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
      const { parent, username, points, tPoints, exeCloBtnText } = this;
      const no = parent.children.length + 1;

      this.userE = CE(
         { class: "user", onclick: `showSelected()` },
         CE({ tag: "input", class: "user-check", type: "checkbox" }),
         (this.noE = CE({ class: "no" }, no)),
         CE({ class: "name" }, username),
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
      const pendingRef = db.ref(this.URL.pending);
      const pendingUserRef = db.ref(this.URL.pendingUser);
      const queueRef = db.ref(this.URL.queue);
      const queueUserRef = db.ref(this.URL.queueUser);
      const requestRef = db.ref(this.URL.request);
      const processUserRef = db.ref(this.URL.processUser);

      asyncHandler(async () => {
         if (this.exeCloBtn.textContent === "EXECUTE") {
            const oldLocation = await queueUserRef.get();

            if (oldLocation.exists()) {
               await queueUserRef.remove();
            }
            await pendingRef.update({ [this.username]: Date.now() });
            hideFloatingWindow();
         } else {
            const snapshot = await processUserRef.get();

            if (snapshot.exists()) {
               await requestRef.update({ [this.username]: Date.now() });
            } else {
               await pendingUserRef.remove();
               await queueRef.update({ [this.username]: Date.now() });
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

   connectDB(db) {
      asyncHandler(async () => {
         const { yy, mm, dd } = date();

         const atStartRef = db.ref(
            `${this.URL.pointUser}/atStart/${yy}${mm}${dd}`
         );
         const oldStartPoints = (await atStartRef.get("value")).val();

         const totalPointsRef = db.ref(`${this.URL.pointUser}/totalPoints`);
         const oldTotalPoints = (await totalPointsRef.get("value")).val();

         const startPoints = oldStartPoints || oldTotalPoints || 0;

         await totalPointsRef.on("value", (snapshot) => {
            if (snapshot.exists()) {
               const value = snapshot.val();
               this.pointE.innerText = this.points = value || 0;
               this.tPointE.innerText = this.tPoints = value - startPoints;
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

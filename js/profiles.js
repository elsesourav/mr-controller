class ManageProfiles {
   constructor(profiles, queueParent, processParent, showSelectedParent) {
      this.profiles = profiles;
      this.queueParent = queueParent;
      this.processParent = processParent;
      this.showSelectedParent = showSelectedParent;
      this.queueProfile = [];
      this.processProfile = [];
      this.showSelected = {};
      this.#setup();
   }

   #setup() {
      this.#createProfileQueueAndProcess();
      this.#createSelectedProfiles();
      this.profilesDB = new Profiles(this.profiles, this.queueProfile, this.processProfile);

      asyncHandler(async () => {
         const executedRef = GET_REF().execute;
         executedRef.on("value", debounce((snap) => {
            this.#updateProfiles(snap.val() || {});
         }, () => 500));
      });
   }

   #updateProfiles(values) {
      const { queue, process, pending, limit } = values;
      executeLimit.innerText = limit;
      this.#updateQueueElements(queue);
      this.#updateProcessElements({ ...process, ...pending });
      this.#setupRunningProfiles(process);

      this.#setProfilesIndex(this.queueParent);
      this.#setProfilesIndex(this.processParent);
   }

   #updateQueueElements(profiles = {}) {
      let count = 0;
      for (let i = 0; i < this.queueProfile.length; i++) {
         const profile = this.queueProfile[i];
         if (profiles[profile.name]) {
            profile.element.classList.remove("hide");
         } else {
            profile.element.classList.add("hide");
         }
         if (!profile.element.classList.contains("hide") && profile.element.firstChild.checked) count++;
      }
      selectedResultN.innerText = count;
   }

   #updateProcessElements(profiles = {}) {
      let count = 0;
      for (let i = 0; i < this.processProfile.length; i++) {
         const profile = this.processProfile[i];
         if (profiles[profile.name]) {
            profile.element.classList.remove("hide");
         } else {
            profile.element.classList.add("hide");
         }
         profile.element.classList.remove("running");
         if (!profile.element.classList.contains("hide") && profile.element.firstChild.checked) count++;
      }
      selectedResultE.innerText = count;
   }

   #setupRunningProfiles(profiles = {}) {
      for (let i = 0; i < this.processProfile.length; i++) {
         const profile = this.processProfile[i];

         if (profiles[profile.name]) {
            this.processParent.insertBefore(profile.element, this.processParent.firstChild);
            profile.element.classList.add("running");
         }
      }
   }

   #createProfileQueueAndProcess() {
      this.#createProfileElements(this.queueParent, "RUN", this.queueProfile);
      this.#createProfileElements(this.processParent, "CLOSE", this.processProfile);
   }

   #createSelectedProfiles() {
      const keys = Object.keys(this.profiles);
      for (let i = 0; i < keys.length; i++) {
         const name = keys[i];

         const closeEle = CE({ tag: "span", class: "u-name hide" }, name);
         closeEle.parent(this.showSelectedParent);
         this.showSelected[name] = closeEle;

         closeEle.click(() => {
            closeEle.classList.add("hide");
            const queueProfile = this.queueProfile.find((e) => e.name === name);
            queueProfile.element.firstChild.checked = false;

            const processProfile = this.processProfile.find((e) => e.name === name);
            processProfile.element.firstChild.checked = false;
            this.setSelectedProfilesSize(this.queueParent, selectedResultN, selectAll);
            this.setSelectedProfilesSize(this.processParent, selectedResultE, selectAllExe);
         });
      }
   }

   #createProfileElements(parent, btnText, profileArray = []) {
      const keys = Object.keys(this.profiles);
      for (let i = 0; i < keys.length; i++) {
         const profile = this.#createProfile(i + 1, keys[i], btnText, profileArray);
         parent.append(profile);
      }
   }

   #createProfile(i, name, btnText, profileArray = []) {
      let element, total, index, points, closeBtn, input;

      element = CE(
         { class: "profile hide", name: name },
         CE({ tag: "input", class: "profile-check", type: "checkbox" }),
         (index = CE({ class: "no" }, i)),
         CE({ class: "name" }, name),
         CE(
            { class: "sbi-redeem point" },
            (total = CE({ tag: "span" }, 0))
         ),
         CE(
            { class: "sbi-today today" },
            (points = CE({ tag: "span" }, 0))
         ),
         CE({ tag: "i", class: "sbi-check" }),
         (closeBtn = CE({ class: "exe-clo" }, btnText))
      );

      profileArray.push({ element, name, index, total, points, closeBtn });
      element.click(() => this.showSelectedProfileAndSize(name));
      return element;
   }

   showSelectedProfileAndSize(name) {
      this.selectProfileElement(name);
      this.setSelectedProfilesSize(this.queueParent, selectedResultN, selectAll);
      this.setSelectedProfilesSize(this.processParent, selectedResultE, selectAllExe);
   }

   setSelectedProfilesSize(parent, resultElement, checkbox) {
      const profiles = getSelectedProfiles([...parent.children]);
      resultElement.innerText = profiles.length;
      const children = [...parent.children].filter(e => !e.classList.contains("hide"));
      const size = children.length;
      checkbox.checked = profiles.length === size && size !== 0;

      if (parent === this.queueParent) {
         notCompleted.checked = isAllUnCompleteSelected();
      }
   }

   #setProfilesIndex(parent) {
      const visibleProfiles = parent.querySelectorAll(".profile:not(.hide)");

      for (let i = 0; i < visibleProfiles.length; i++) {
         visibleProfiles[i].children[1].innerText = i + 1;
      }
   }

   selectProfileElement(name) {
      const isChecked = this.showSelected[name].firstChild.checked;
      this.showSelected[name].classList.toggle("hide", isChecked);
   }

   executeAllProfiles() {
      this.profilesDB.executeAllProfiles();
   }

   closeAllProfiles(profiles) {
      this.profilesDB.closeAllProfiles(profiles);
   }
}

class Profiles {
   constructor(profiles, queueProfile, processProfile) {
      this.profiles = profiles;
      this.queueProfile = queueProfile;
      this.processProfile = processProfile;
      this.#setup();
   }

   #setup() {
      this.#addClickActions();
      this.connectDB();
   }

   #addClickActions() {
      for (let i = 0; i < this.queueProfile.length; i++) {
         const profile = this.queueProfile[i];
         this.#queueClickAction(profile.name, profile.closeBtn);
      }

      for (let i = 0; i < this.processProfile.length; i++) {
         const profile = this.processProfile[i];
         this.#processClickAction(profile.name, profile.closeBtn);
      }
   }

   #queueClickAction(name, closeBtn) {
      closeBtn.addEventListener("click", () => {
         asyncHandler(async () => {
            const oldLocation = await GET_REF(name).profileQueue.get();

            if (oldLocation.exists()) {
               await GET_REF(name).profileQueue.remove();
            }
            await GET_REF().pending.update({ [name]: Date.now() });
            hideFloatingWindow();
         });
      });
   }

   #processClickAction(name, closeBtn) {
      closeBtn.addEventListener("click", () => {
         asyncHandler(async () => {
            const snap = await GET_REF(name).profileProcess.get();

            if (snap.exists()) {
               await GET_REF().requests.update({ [name]: Date.now() });
            } else {
               await GET_REF(name).profilePending.remove();
               await GET_REF().queue.update({ [name]: Date.now() });
            }
            hideFloatingWindow();
         });
      });
   }

   connectDB() {
      asyncHandler(async () => {
         const keys = Object.keys(this.profiles);
         for (let i = 0; i < keys.length; i++) {
            const totalPointsRef = GET_REF(keys[i]).totalPoints;
            const todayPointsRef = GET_REF(keys[i]).todayPoints;

            await totalPointsRef.on("value", (snap) => {
               if (snap.exists()) {
                  const value = snap.val();
                  this.queueProfile[i].total.innerText = value;
                  this.processProfile[i].total.innerText = value;
               }
            });

            await todayPointsRef.on("value", (snap) => {
               if (snap.exists()) {
                  const value = snap.val();
                  const { isActivitiesComplete, mobile, pc } = value;

                  let str = "";
                  if (mobile?.progress) str += mobile.progress;
                  if (pc?.progress) str += `+${pc.progress}`;
                  if (isActivitiesComplete) str += `+E`;
                  this.queueProfile[i].points.innerText = str;
                  this.processProfile[i].points.innerText = str;


                  const isComplete = isActivitiesComplete && mobile.max === mobile.progress && pc.max === pc.progress;

                  if (isComplete) {
                     this.queueProfile[i].element.classList.add("complete");
                     this.processProfile[i].element.classList.add("complete");
                  } else {
                     this.queueProfile[i].element.classList.remove("complete");
                     this.processProfile[i].element.classList.remove("complete");
                  }
               }
            });
         }
      });
   }

   executeAllProfiles() {
      asyncHandler(async () => {
         showLoading();
         const profiles = getSelectedProfileNames([...scrollNormal.children]);

         for (let i = 0; i < profiles.length; i++) {
            const name = profiles[i];
            if (i === profiles.length - 2)
               await this.#executeProfile(name);
            else
               this.#executeProfile(name);
         }
         hideFloatingWindow();
      });
   }

   closeAllProfiles(profiles) {
      asyncHandler(async () => {
         showLoading();
         profiles = profiles || getSelectedProfileNames([...scrollExecute.children]);

         for (let i = 0; i < profiles.length; i++) {
            const name = profiles[i];
            if (i === profiles.length - 2)
               await this.#closeProfile(name);
            else
               this.#closeProfile(name);
         }
         hideFloatingWindow();
      });
   }

   async #executeProfile(name) {
      const oldLocation = await GET_REF(name).profileQueue.get();
      if (oldLocation.exists()) {
         await GET_REF(name).profileQueue.remove();
      }
      await GET_REF().pending.update({ [name]: Date.now() });
   }

   async #closeProfile(name) {
      const snap = await GET_REF(name).profileProcess.get();
      if (snap.exists()) {
         await GET_REF().requests.update({ [name]: Date.now() });
      } else {
         await GET_REF(name).profilePending.remove();
         await GET_REF().queue.update({ [name]: Date.now() });
      }
   }
}

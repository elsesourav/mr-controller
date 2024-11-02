const signupUser = async (username, password) => {
   showLoading();
   try {
      await auth.createUserWithEmailAndPassword(`${username}@gmail.com`, password);
      const adminRef = GET_REF().admin;
      const executeRef = GET_REF().execute;

      const { hash, salt } = await hashPassword(password);
      await adminRef.set({ pass: `${hash} ${salt}`, id: Date.now() });
      await executeRef.set({ limit: LOCAL_SAVED.numOfExecute });

      LOCAL_SAVED.username = username;
      setDataFromLocalStorage(STORAGE_KEY, LOCAL_SAVED);
      hideFloatingWindow();
   } catch (error) {
      showAlert(
         {
            message: JSON.parse(error.message).error.message,
            title: `ERROR ${error.code}`,
         },
         () => {
            setupUserForm(isSignin);
         }
      );
   }
};

const signinUser = async (username, password) => {
   showLoading();
   try {
      const userCredential = await auth.signInWithEmailAndPassword(`${username}@gmail.com`, password);
      LOCAL_SAVED.username = username;
      setDataFromLocalStorage(STORAGE_KEY, LOCAL_SAVED);
      hideFloatingWindow();
   } catch (error) {
      showAlert(
         {
            message: JSON.parse(error.message).error.message,
            title: `ERROR ${error.code}`,
         },
         () => {
            setupUserForm(isSignin);
         }
      );
   }
};

async function updateExecuteLimit(_, __, e) {
   const executeLimitValue = I("#executeLimit").value;

   if (executeLimitValue !== LOCAL_SAVED.numOfExecute) {
      showLoading();
      const savedData = getDataFromLocalStorage(STORAGE_KEY);
      LOCAL_SAVED.numOfExecute = savedData.numOfExecute = executeLimitValue;

      const executeRef = GET_REF().execute;
      await executeRef.update({ limit: savedData.numOfExecute });
      setDataFromLocalStorage(STORAGE_KEY, savedData);
      hideFloatingWindow();
   }
}

async function reloadSelectedProfiles() {
   const DATA = getDataFromLocalStorage(STORAGE_KEY);

   const settings = { reload_ID: Date.now() };
   DATA.reload_ID = settings.reload_ID;
   setDataFromLocalStorage(STORAGE_KEY, DATA);

   const profiles = getSelectedProfileNames();

   showLoading();
   for (let i = 0; i < profiles.length; i++) {
      const name = profiles[i];
      if (i === profiles.length - 2) await updateProfileSettings(name, settings);
      else updateProfileSettings(name, settings);
   }
   hideFloatingWindow();
}

async function stopSelectedProfiles() {
   const DATA = getDataFromLocalStorage(STORAGE_KEY);

   const settings = { stop_ID: Date.now() };
   DATA.stop_ID = settings.stop_ID;
   setDataFromLocalStorage(STORAGE_KEY, DATA);
   const profiles = getSelectedProfileNames();

   showLoading();

   for (let i = 0; i < profiles.length; i++) {
      const name = profiles[i];
      if (i === profiles.length - 2) await updateProfileSettings(name, settings);
      else updateProfileSettings(name, settings);
   }
   hideFloatingWindow();
}

async function logoutUser() {
   showAlert(
      {
         message: "Are you sure you want to log out?",
         btnText: "No",
         optionalBtnText: "Yes",
      },
      hideFloatingWindow,
      async () => {
         signOutUser();
         setupUserForm();
      }
   );
}

async function updateAllProfilesSettings() {
   const DATA = getDataFromLocalStorage(STORAGE_KEY);
   const settings = { ...DATA };
   const profiles = getSelectedProfileNames();

   delete settings.isOpenAllUsers;
   delete settings.isOpenExecuteUsers;
   delete settings.numOfExecute;
   delete settings.username;

   showLoading();
   for (let i = 0; i < profiles.length; i++) {
      const name = profiles[i];
      if (i === profiles.length - 2) await updateProfileSettings(name, settings);
      else updateProfileSettings(name, settings);
   }
   hideFloatingWindow();
}

async function updateProfileSettings(name, settings) {
   const profileSettingsRef = GET_REF(name).profileSettings;
   await profileSettingsRef.update(settings);
}

async function killApp() {
   const profilesName = getNonHideProfilesNames([...scrollExecute.children]);

   if (profilesName.length > 0) {
      showAlert({
         message: "Are you sure you want to Fully Close the Browser?",
         btnText: "No",
         optionalBtnText: "Yes",
      }, hideFloatingWindow, async () => {
         manageProfiles.closeAllProfiles(profilesName);
         const killAppRef = GET_REF().killApp;
         await killAppRef.set(Date.now());
      });
   }
}

const signupUser = async (username, password) => {
   showLoading();
   auth
      .createUserWithEmailAndPassword(`${username}@gmail.com`, password)
      .then(async (userCredential) => {
         const admin = db.ref(`admins/${username}`);
         const { hash, salt } = await hashPassword(password);

         await admin.set({ username, hash, salt, date: Date.now() });
         const executeLimitRef = db.ref(`admins/${username}/execute/`);
         await executeLimitRef.set({ limit: LOCAL_SAVED.numOfExecute });

         LOCAL_SAVED.username = username;
         setDataFromLocalStorage(STORAGE_KEY, LOCAL_SAVED);
         hideFloatingWindow();
      })
      .catch((error) => {
         showAlert(
            { message: error.message, title: `ERROR ${error.code}` },
            () => {
               setupUserForm(isSignin);
            }
         );
      });
};

const signinUser = async (username, password) => {
   showLoading();
   auth
      .signInWithEmailAndPassword(`${username}@gmail.com`, password)
      .then(async (userCredential) => {
         LOCAL_SAVED.username = username;
         setDataFromLocalStorage(STORAGE_KEY, LOCAL_SAVED);
         hideFloatingWindow();
      })
      .catch((error) => {
         showAlert(
            { message: error.message, title: `ERROR ${error.code}` },
            () => {
               setupUserForm(isSignin);
            }
         );
      });
};

I("#startBtn").click(async (_, __, e) => {
   const executeLimitValue = I("#executeLimit").value;
   
   if (executeLimitValue !== LOCAL_SAVED.numOfExecute) {
      showLoading();
      const savedData = getDataFromLocalStorage(STORAGE_KEY);
      const username = savedData.username;
      LOCAL_SAVED.numOfExecute = savedData.numOfExecute = executeLimitValue;
   
      const executeLimitRef = db.ref(`admins/${username}/execute/`);
      await executeLimitRef.update({ limit: savedData.numOfExecute });
      setDataFromLocalStorage(STORAGE_KEY, savedData);
      e.parentNode.classList.remove("not-updated");
      hideFloatingWindow();
   }
});

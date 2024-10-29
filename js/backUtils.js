const signupUser = async (username, password) => {
   showLoading();
   try {
      const userCredential = await auth.createUserWithEmailAndPassword(`${username}@gmail.com`, password);
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

I("#startBtn").click(async (_, __, e) => {
   const executeLimitValue = I("#executeLimit").value;

   if (executeLimitValue !== LOCAL_SAVED.numOfExecute) {
      showLoading();
      const savedData = getDataFromLocalStorage(STORAGE_KEY);
      const username = savedData.username;
      LOCAL_SAVED.numOfExecute = savedData.numOfExecute = executeLimitValue;

      const executeRef = GET_REF().execute;
      await executeRef.update({ limit: savedData.numOfExecute });
      setDataFromLocalStorage(STORAGE_KEY, savedData);
      e.parentNode.classList.remove("not-updated");
      hideFloatingWindow();
   }
});

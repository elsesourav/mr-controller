firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function getUser() {
   return auth.currentUser;
}

function signOutUser() {
   auth.signOut();
}

window.addEventListener("load", async () => {
   // Initialization logic if needed
});

auth.onAuthStateChanged(async (user) => {
   if (user) {
      setup();
      hideFloatingWindow(2000);
   } else {
      setupUserForm();
   }
});

const moveUser = asyncHandler(async (username) => {
   showLoading();
});

async function setup() {
   const DATA = getDataFromLocalStorage(STORAGE_KEY);
   const { yy, mm, dd } = date();
   if (DATA.username) username = DATA.username;

   I("#normalProfiles").toggle("active", DATA.isOpenAllUsers);
   I("#executeProfiles").toggle("active", DATA.isOpenExecuteUsers);
   I("#settings").toggle("active", DATA.isOpenSettings);
   I("#executeLimit")[0].value = DATA.numOfExecute;
   LOCAL_SAVED.numOfExecute = DATA.numOfExecute;

   const profileNamesRef = GET_REF().names;
   const executeRef = GET_REF().execute;

   await profileNamesRef.get().then((snapshot) => {
      if (snapshot.exists()) {
         const names = snapshot.val();
         manageProfiles = new ManageProfiles(names, scrollNormal, scrollExecute, showSelectedParent, scrollGraph);
      }
   });

   executeRef.get().then((snapshot) =>
      asyncHandler(async () => {
         const value = snapshot.val();
         if (!value || !value[`${yy}${mm}${dd}`]) {
            const { limit } = value || {};
            executeRef.set({
               [`${yy}${mm}${dd}`]: true,
               limit: limit || 0,
               pending: {},
               process: {},
               queue: updateObjectDate(manageProfiles.profiles),
               requests: {},
            }).then(console.log);
         }
      })
   );
}



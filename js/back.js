firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function getUser() {
   return auth.currentUser;
}

function signOutUser() {
   firebase.auth().signOut();
}

window.addEventListener("load", async () => {
   // if (!getUser()) {
   //    setupUserForm();
   // }
});

auth.onAuthStateChanged(async (user) => {
   if (user) {
      setup();
      hideFloatingWindow(2000);
   } else {
      setupUserForm();
   }
});

const normalUsers = I("#normalUsers .scroll")[0];
const executeUsers = I("#executeUsers .scroll")[0];

const moveUser = asyncHandler(async (username) => {
   showLoading();
});

async function setup() {
   const DATA = getDataFromLocalStorage(STORAGE_KEY);
   const { yy, mm, dd } = date();

   I("#normalUsers").toggle("active", DATA.isOpenAllUsers);
   I("#executeUsers").toggle("active", DATA.isOpenExecuteUsers);
   I("#executeLimit")[0].value = DATA.numOfExecute;
   LOCAL_SAVED.numOfExecute = DATA.numOfExecute;
   const username = DATA.username;
   const USERS = [];

   const adminData = db.ref(`admins/${username}/users/`);
   await adminData.get().then((snapshot) => {
      if (snapshot.exists()) {
         const users = snapshot.val();
         for (const key in users) {
            userBlocks[key] = new UserBlock(normalUsers, key, username);
            USERS.push(key);
            userBlocks[key].connectDB(db);
         }
      }
   });

   const executeRef = db.ref(`admins/${username}/execute/`);

   executeRef.get().then((snapshot) =>
      asyncHandler(async () => {
         const value = snapshot.val();
         
         if (!(value && value[`${yy}${mm}${dd}`])) {
            const { limit } = value;
            executeRef
               .set({
                  [`${yy}${mm}${dd}`]: true,
                  limit: limit || 0,
                  pending: {},
                  process: {},
                  queue: arrayToObject(USERS),
                  requests: {},
               })
               .then((e) => {
                  console.log(e);
               });
         }
      })
   );

   executeRef.on("value", (snapshot) => {
      if (snapshot.exists()) {
         const value = snapshot.val();
         changeUsersParentAll(value);
      }
   });
}

function changeUsersParentAll(value) {
   parent.innerHTML = "";
   const { pending, process, queue } = value;
   changeUsersParent(queue);
   changeUsersParent(process, false, true);
   changeUsersParent(pending, false);
}

function changeUsersParent(usernames = {}, isQueue = true, isProcess) {
   const parent = isQueue ? normalUsers : executeUsers;

   for (const key in usernames) {
      userBlocks[key].updateParent(parent);
      userBlocks[key].updateRunningStatus(false);
   }

   if (!isQueue && isProcess) {
      for (const key in usernames) {
         userBlocks[key].updateRunningStatus(true);
      }
   }

   const s1 = [...scrollNormal.children].filter((e) => e.firstChild.checked);
   const s2 = [...scrollExecute.children].filter((e) => e.firstChild.checked);
   selectedResultN.innerText = s1.length;
   selectedResultE.innerText = s2.length;
}

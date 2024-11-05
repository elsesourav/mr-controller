const manuallySearchInputsCheckbox = I(".manually-search-inputs .inp-checkbox");
const limitInputs = I("input[type=number].inp-limit");
const scrollNormal = I("#scrollNormal")[0];
const scrollExecute = I("#scrollExecute")[0];
const showSelectedParent = I("#showSelectedParent")[0];


I(".toggle").click((_, i) => {
   I(".marge")[i].toggle("active");
});

const getInputDelay = () => {
   return I("#takeInputDelay").checked ? parseInt(I("#waitForInput").value) * 1000 : 200;
};

const saveStorage = () => {
   const savedData = getDataFromLocalStorage(STORAGE_KEY);
   [...I(".controls .inp-checkbox")].forEach(
      (input) => (savedData[input.name] = input.checked)
   );
   [...I(".controls .inp-limit")].forEach(
      (input) => (savedData[input.name] = input.value)
   );

   setDataFromLocalStorage(STORAGE_KEY, savedData);
};

(() => {
   if (!getDataFromLocalStorage(STORAGE_KEY))
      setDataFromLocalStorage(STORAGE_KEY, LOCAL_SAVED);

   const DATA = getDataFromLocalStorage(STORAGE_KEY);

   [...I(".controls .inp-checkbox")].forEach((input) => {
      input.checked = DATA[input.name];
   });
   [...I(".controls .inp-limit")].forEach((input) => {
      input.value = DATA[input.name];
   });
})();

const autoInputCheckbox = I(".basic-grid .inp-checkbox");
const numInpLimit = I(".two-input .inp-limit");
const twoInputCheckboxes = I(".two-input .inp-checkbox");


I(".two-input .inc").click((_, i) => {
   incDec(numInpLimit, i, 1);
});
I(".two-input .dec").click((_, i) => {
   incDec(numInpLimit, i, -1);
});

limitInputs.on("input", async (_, i, ele) => {
   const n = (ele.value = parseInt(ele.value || 0));
   savedLimitValue(ele.name, n);
});

const manuallySearchInputCheckboxes = I(".manually-search-inputs .inp-checkbox");
manuallySearchInputCheckboxes.click((_, i) => {
   if (i === 2 || i === 3) {
      manuallySearchInputCheckboxes[0].checked = false;
      manuallySearchInputCheckboxes[1].checked = false;
      manuallySearchInputCheckboxes[i === 2 ? 3 : 2].checked = false;
   } else if (i === 0 || i === 1) {
      manuallySearchInputCheckboxes[2].checked = false;
      manuallySearchInputCheckboxes[3].checked = false;
   }
});

autoComplete.click(() => {
   manuallySearchInputCheckboxes.each((e) => (e.checked = false));
});
autoInputCheckbox.on("change", saveStorage);

I(".pass").each((e) => {
   I(".eye", e).click(() => {
      const input = I("input", e)[0];
      input.type = input.type === "password" ? "text" : "password";
   });
});

const showAlert = (
   {
      title = "ALERT",
      message = "Your Alert Message Here.",
      btnText = "Okay",
      optionalBtnText,
   } = {},
   fun,
   optionalFun
) => {
   I("#floatingWindow").addClass("active");
   I("#floatingWindow .window").removeClass("active");
   I("#floatingWindow .alert").addClass("active");

   I("#alertTitle").text(title);
   I("#alertMessage").html(message);
   I("#hideAlert").text(btnText);

   if (optionalBtnText) {
      I("#optionalBtn").text(optionalBtnText);
      I("#optionalBtn").addClass("active");

      I("#optionalBtn").click(
         () => {
            if (typeof optionalFun === "function") {
               optionalFun();
            } else {
               I("#floatingWindow").removeClass("active");
            }
         },
         { once: true }
      );
   } else {
      I("#optionalBtn").removeClass("active");
   }

   I("#hideAlert").click(
      () => {
         if (typeof fun === "function") {
            fun();
         } else {
            I("#floatingWindow").removeClass("active");
         }
      },
      { once: true }
   );
};

let isSignin = false;
const setupUserForm = (isSignin = false) => {
   I("#floatingWindow").addClass("active");
   I("#floatingWindow .window").removeClass("active");
   I("#floatingWindow .form").addClass("active");
   I("#floatingWindow .form form input").each((e) => (e.value = ""));

   I("#floatingWindow .form form")[0].classList = [
      isSignin ? "signin" : "signup",
   ];
};
I("#floatingWindow .form form .switch").click(() => {
   isSignin = !isSignin;
   setupUserForm(isSignin);
});
const showLoading = () => {
   I("#floatingWindow").addClass("active");
   I("#floatingWindow .window").removeClass("active");
   I("#floatingWindow .loading").addClass("active");
};

const hideFloatingWindow = (ms = 0) => {
   setTimeout(() => {
      I("#floatingWindow").removeClass("active");
      I("#floatingWindow .window").removeClass("active");
   }, ms);
};

I("#submit").click((event) => {
   event.preventDefault();
   const username = I("#username").value?.trim();
   const password = I("#password").value?.trim();
   const confirmPassword = I("#coPassword").value?.trim();

   if (username && password && isSignin) {
      signinUser(username, password);
   } else if (username && password && password === confirmPassword) {
      signupUser(username, password);
   } else if (password && password !== confirmPassword) {
      showAlert(
         {
            message: "Passwords and Confirm Password do not match.",
            title: "ERROR",
         },
         () => {
            setupUserForm(isSignin);
         }
      );
   }
});

I("#allUsersToggle").click(() => {
   const is = normalProfiles.classList.contains("active");
   const savedData = getDataFromLocalStorage(STORAGE_KEY);
   savedData.isOpenAllUsers = is;
   setDataFromLocalStorage(STORAGE_KEY, savedData);
});

I("#executeUserToggle").click(() => {
   const is = executeProfiles.classList.contains("active");
   const savedData = getDataFromLocalStorage(STORAGE_KEY);
   savedData.isOpenExecuteUsers = is;
   setDataFromLocalStorage(STORAGE_KEY, savedData);
});

I("#settingsToggle").click(() => {
   const is = settings.classList.contains("active");
   const savedData = getDataFromLocalStorage(STORAGE_KEY);
   savedData.isOpenSettings = is;
   setDataFromLocalStorage(STORAGE_KEY, savedData);
});

I(".inc-dec .in-de").click(async (_, __, e) => {
   if (LOCAL_SAVED.numOfExecute !== I("#executeLimit").value) {
      e.parentNode.parentNode.parentNode.classList.add("not-updated");
   } else {
      e.parentNode.parentNode.parentNode.classList.remove("not-updated");
   }
});


selectAll.click((_, __, ele) => {
   const isChecked = ele.checked;
   const profiles = [...scrollNormal.children].filter((e) => !e.classList.contains("hide"));

   notCompleted.checked = isChecked;
   selectedResultN.innerText = isChecked ? profiles.length : 0;
   selectProfiles(profiles, isChecked);
});

notCompleted.click((_, __, ele) => {
   const isChecked = ele.checked;
   const profiles = [...scrollNormal.children].filter((e) => !e.classList.contains("complete") && !e.classList.contains("hide"));
   selectProfiles(profiles, isChecked);
   const updatedProfiles = getSelectedProfiles([...scrollNormal.children]);
   selectedResultN.innerText = updatedProfiles.length;
});

selectAllExe.click((_, __, ele) => {
   const isChecked = ele.checked;
   const profiles = [...scrollExecute.children].filter((e) => !e.classList.contains("hide"));
   selectedResultE.innerText = isChecked ? profiles.length : 0;
   selectProfiles(profiles, isChecked);
});

I("#updateLimitBtn").click(updateExecuteLimit);
I("#reloadBtn").click(reloadSelectedProfiles);
I("#stopBtn").click(stopSelectedProfiles);
I("#updateButton").click(updateAllProfilesSettings);
I(".logout").click(logoutUser);
I("#killApp").click(killApp);

executedSelectedAll.click(() => {
   manageProfiles.executeAllProfiles();
   selectProfiles([...scrollNormal.children], false);
});

closeExecuted.click(() => {
   manageProfiles.closeAllProfiles();
   selectProfiles([...scrollExecute.children], false);
});

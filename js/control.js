const checkboxInputs = I("input[type=checkbox].inp-checkbox");
const manuallySearchInputsCheckbox = I(".manually-search-inputs .inp-checkbox");
const limitInputs = I("input[type=number].inp-limit");

I(".users .toggle").click((_, i) => {
   I(".users")[i].toggle("active");
});

const updateStorage = (fun = () => {}) => {
   // checkboxInputs.each((ele) => {
   //    const name = ele.attr("name");
   //    if (name === "auto_complete")
   //       defaultSwitches.auto_complete_manual = ele.checked;
   //    defaultSwitches[name] = ele.checked;
   // });
   // limitInputs.each((ele, i) => {
   //    defaultLimits[ele.attr("name")] = parseInt(ele.value);
   // });
   // const manuallyWork = {
   //    pc_search_limit: I("#pcSearch").checked && parseInt(I("#pcLimit").value),
   //    mobile_search_limit:
   //       I("#mobileSearch").checked && parseInt(I("#mobileLimit").value),
   //    daily_event: I("#dailyEvent").checked,
   //    banner_event: I("#bannerEvent").checked,
   // };
   // setDataToLocalStorage(tempStorageKey, manuallyWork);
   // setDataToLocalStorage(STORAGE_KEY, { defaultLimits, defaultSwitches }, fun);
};

const getInputDelay = () => {
   return I("#takeInputDelay").checked
      ? parseInt(I("#waitForInput").value) * 1000
      : 200;
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

// default Setup
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

// increase decrease button (only switch limit input)
const autoInputCheckbox = I(".basic-grid .inp-checkbox");
const numInpLimit = I(".two-input .inp-limit");
const twoInputCheckboxes = I(".two-input .inp-checkbox");

function savedAndSendBackgroundManualAction(ele = false) {
   return new Promise(async (resolve) => {
      getDataToLocalStorage(STORAGE_KEY, async (DATA = LOCAL_SAVED) => {
         const eleIs = ele?.checked;
         manuallySearchInputsCheckbox.each((e) => {
            DATA[e.name] = e.checked = false;
         });
         if (ele) DATA[ele.name] = ele.checked = eleIs;

         await setDataToLocalStorage(STORAGE_KEY, DATA);
         resolve();
      });
   });
}

function savedLimitValue(name, n) {
   return new Promise((resolve) => {
      getDataToLocalStorage(STORAGE_KEY, async (DATA = LOCAL_SAVED) => {
         if (DATA[name] !== undefined) DATA[name] = N(n);
         await setDataToLocalStorage(STORAGE_KEY, DATA);
         resolve();
      });
   });
}

function savedAutoCompleteCheckboxes(ele) {
   return new Promise((resolve) => {
      getDataToLocalStorage(STORAGE_KEY, async (DATA = LOCAL_SAVED) => {
         if (DATA[ele.name] !== undefined) {
            DATA[ele.name] = ele.checked;
         }
         await setDataToLocalStorage(STORAGE_KEY, DATA);
         resolve();
      });
   });
}

async function incDec(elements, i, inDe = 1) {
   const val = N(elements[i].value);

   if (val + inDe >= 0) {
      elements[i].value = val + inDe;
      await savedLimitValue(elements[i].name, val + inDe);

      if (
         elements[i].classList.contains("num") &&
         checkboxesWithNum[i].checked
      ) {
         checkboxesWithNum[i].checked = false;
         savedAndSendBackgroundManualAction();
      }
   }
}

// increase decrease button
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

// work any particular task in one time other work auto turn off (manually)
const manuallySearchInputCheckboxes = I(
   ".manually-search-inputs .inp-checkbox"
);
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

/* -------- user event -------- */

I(".pass").each((e) => {
   I(".eye", e).click(() => {
      const input = I("input", e)[0];
      input.type = input.type === "password" ? "text" : "password";
   });
});

const showAlert = (
   {
      title = "ALERT",
      message = "Your Alert Message Hare.",
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

I("#allUsersToggle").click((e, _, ele) => {
   const is = ele.parentNode.parentNode.classList.contains("active");
   const savedData = getDataFromLocalStorage(STORAGE_KEY);
   savedData.isOpenAllUsers = is;
   setDataFromLocalStorage(STORAGE_KEY, savedData);
});

I("#executeUserToggle").click((e, _, ele) => {
   const is = ele.parentNode.parentNode.classList.contains("active");
   const savedData = getDataFromLocalStorage(STORAGE_KEY);
   savedData.isOpenExecuteUsers = is;
   setDataFromLocalStorage(STORAGE_KEY, savedData);
});

I(".inc-dec .in-de").click(async (_, __, e) => {
   if (LOCAL_SAVED.numOfExecute !== I("#executeLimit").value) {
      e.parentNode.parentNode.parentNode.classList.add("not-updated");
   } else {
      e.parentNode.parentNode.parentNode.classList.remove("not-updated");
   }
});

const scrollNormal = I(".scroll.normal")[0];
const scrollExecute = I(".scroll.execute")[0];

scrollNormal.click((_, __, ele) => {
   let users = [...ele.children];
   const allUsersChecked = users.filter((e) => e.firstChild.checked);

   if (isUnCompleteChecked(users)) selectAll.checked = true;
   else selectAll.checked = false;

   if (isCompleteChecked(users)) completed.checked = true;
   else completed.checked = false;

   selectedResultN.innerText = allUsersChecked.length;
});

scrollExecute.click((_, __, ele) => {
   let users = [...ele.children];
   const allUsersChecked = users.filter((e) => e.firstChild.checked);

   if (users.length !== 0 && users.length === allUsersChecked.length)
      selectAllExe.checked = true;
   else selectAllExe.checked = false;

   selectedResultE.innerText = allUsersChecked.length;
});

selectAll.click((_, __, ele) => {
   const isChecked = ele.checked;
   const users = [...scrollNormal.children];
   const usersNew = users.filter(
      (e) => !e.children[5].classList.contains("complete")
   );
   usersNew.forEach((e) => (e.firstChild.checked = isChecked));
   selectedResultN.innerText = users.filter((e) => e.firstChild.checked).length;
   showSelected();
});

completed.click((_, __, ele) => {
   const isChecked = ele.checked;
   const users = [...scrollNormal.children];
   const usersNew = users.filter((e) =>
      e.children[5].classList.contains("complete")
   );
   usersNew.forEach((e) => (e.firstChild.checked = isChecked));
   selectedResultN.innerText = users.filter((e) => e.firstChild.checked).length;
   showSelected();
});

selectAllExe.click((_, __, ele) => {
   const isChecked = ele.checked;
   const users = [...scrollExecute.children];
   const usersNew = users.filter(
      (e) => !e.children[5].classList.contains("complete")
   );
   usersNew.forEach((e) => (e.firstChild.checked = isChecked));
   selectedResultE.innerText = users.filter((e) => e.firstChild.checked).length;
   showSelected();
});

executedSelectedAll.click(() => {
   const users = [...scrollNormal.children];
   const selectedUsers = users.filter((e) => e.firstChild.checked);

   selectedUsers.forEach((e) => {
      const name = e.children[2].innerText;
      userBlocks[name].clickAction();
   });
});

closeExecuted.click(() => {
   const users = [...scrollExecute.children];
   const selectedUsers = users.filter((e) => e.firstChild.checked);

   selectedUsers.forEach((e) => {
      const name = e.children[2].innerText;
      userBlocks[name].clickAction();
   });
});

I("#updateButton").click(async () => {
   const DATA = getDataFromLocalStorage(STORAGE_KEY);

   const username = DATA.username;
   const settings = { ...DATA };
   const users = [...selectedUsers.children].map((u) => u.innerText);

   delete settings.isOpenAllUsers;
   delete settings.isOpenExecuteUsers;
   delete settings.numOfExecute;
   delete settings.username;

   showLoading();
   for (const user of users) {
      const profileSettingsRef = GET_REF(user).profileSettings;
      await profileSettingsRef.update(settings);
   }
   hideFloatingWindow();
});

I("#reloadBtn").click(async () => {
   const DATA = getDataFromLocalStorage(STORAGE_KEY);

   const username = DATA.username;
   const settings = { reload_ID: Date.now() };
   DATA.reload_ID = settings.reload_ID;
   setDataFromLocalStorage(STORAGE_KEY, DATA);
   
   const users = [...selectedUsers.children].map((u) => u.innerText);

   showLoading();
   for (const user of users) {
      const profileSettingsRef = GET_REF(user).profileSettings;
      await profileSettingsRef.update(settings);
   }
   hideFloatingWindow();
});

I("#stopBtn").click(async () => {
   const DATA = getDataFromLocalStorage(STORAGE_KEY);

   const username = DATA.username;
   const settings = { stop_ID: Date.now() };
   DATA.stop_ID = settings.stop_ID;
   setDataFromLocalStorage(STORAGE_KEY, DATA);

   const users = [...selectedUsers.children].map((u) => u.innerText);

   showLoading();
   for (const user of users) {
      const profileSettingsRef = GET_REF(user).profileSettings;
      await profileSettingsRef.update(settings);
   }
   hideFloatingWindow();
});

// call by html onclick
function showSelected() {
   selectedUsers.innerText = "";
   const users = [...scrollNormal.children, ...scrollExecute.children];
   const userSelected = users.filter((e) => e.firstChild.checked);

   userSelected.forEach((ele) => {
      const name = ele.children[2].innerText;
      let closeEle;
      CE(
         { tag: "span", class: "u-name" },
         CE({ tag: "x" }, name),
         (closeEle = CE({ tag: "i", class: "sbi-close close" }))
      ).parent(selectedUsers);

      closeEle.click(
         () => {
            ele.firstChild.checked = false;
            showSelected();
         },
         { once: true }
      );
   });
}
showSelected();

I(".logout").click(() => {
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
});

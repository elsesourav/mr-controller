function getSelectedProfileNames(
   profiles = [...scrollNormal.children, ...scrollExecute.children]
) {
   return profiles.filter((e) => !e.classList.contains("hide") && e.firstChild.checked).map((e) => e.children[2].innerText);
}
function getSelectedProfiles(
   profiles = [...scrollNormal.children, ...scrollExecute.children]
) {
   return profiles.filter((e) => !e.classList.contains("hide") && e.firstChild.checked);
}

function isAllUnCompleteSelected() {
   const profiles = [...scrollNormal.children];
   const unCompleteProfiles = profiles.filter((e) => !e.classList.contains("hide") && !e.classList.contains("complete"));
   const unCompleteProfilesChecked = unCompleteProfiles.filter((e) => e.firstChild.checked);
   return unCompleteProfiles.length && unCompleteProfiles.length === unCompleteProfilesChecked.length;
}

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

      if (elements[i].classList.contains("num") && checkboxesWithNum[i].checked) {
         checkboxesWithNum[i].checked = false;
         savedAndSendBackgroundManualAction();
      }
   }
}

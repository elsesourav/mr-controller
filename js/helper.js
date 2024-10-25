function isUnCompleteChecked(elements) {
   const unCompleteUsers = elements.filter((e) => !e.children[5].classList.contains("complete"));
   const unCompleteUsersChecked = unCompleteUsers.filter((e) => e.firstChild.checked);
   return unCompleteUsers.length !== 0 && unCompleteUsers.length === unCompleteUsersChecked.length;
}

function isCompleteChecked(elements) {
   const unCompleteUsers = elements.filter((e) => e.children[5].classList.contains("complete"));
   const unCompleteUsersChecked = unCompleteUsers.filter((e) => e.firstChild.checked);
   return unCompleteUsers.length !== 0 && unCompleteUsers.length === unCompleteUsersChecked.length;
}
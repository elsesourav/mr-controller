function isUnCompleteChecked(elements) {
   const unCompleteUsers = elements.filter((e) => !e.children[5].classList.contains("complete"));
   const unCompleteUsersChecked = unCompleteUsers.filter((e) => e.firstChild.checked);
   return unCompleteUsers.length && unCompleteUsers.length === unCompleteUsersChecked.length;
}

function isCompleteChecked(elements) {
   const completeUsers = elements.filter((e) => e.children[5].classList.contains("complete"));
   const completeUsersChecked = completeUsers.filter((e) => e.firstChild.checked);
   return completeUsers.length && completeUsers.length === completeUsersChecked.length;
}
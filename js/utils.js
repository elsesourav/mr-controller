"use strict";
const rootStyle = document.querySelector(":root").style;
const isMobile =
   localStorage.mobile ||
   "ontouchstart" in window ||
   navigator.maxTouchPoints > 0 ||
   navigator.msMaxTouchPoints > 0;

if (!isMobile) rootStyle.setProperty("--cursor", "pointer");

const STORAGE_KEY = "mr-container-storage";

const LOCAL_SAVED = {
   isOpenAllUsers: true,
   isOpenExecuteUsers: true,
   numOfExecute: 6,
   username: undefined,

   reload_ID: 1729814979947,
   stop_ID: 1729814979947,

   auto_close: true,
   auto_complete: false,
   auto_daily_event: true,
   auto_banner_event: true,
   auto_pc_search: true,
   auto_mobile_search: true,
   auto_recheck: true,
   auto_start: true,
   banner_event: false,
   daily_event: false,
   pc_search: false,
   mobile_search: false,
   pc_search_limit: 10,
   mobile_search_limit: 0,
   not_search_delay_limit: 900,
   search_delay_limit: 5,
};
const userBlocks = {};
let username;

function GET_REF(accountName = "////") {
   const { yy, mm, dd } = date();
   
   return {
      admin: db.ref(`admins/${username}`),
      execute: db.ref(`admins/${username}/execute`),
      names: db.ref(`admins/${username}/profiles/names`),
      settings: db.ref(`admins/${username}/profiles/settings`),
      points: db.ref(`admins/${username}/profiles/points`),

      pending: db.ref(`admins/${username}/execute/pending`),
      process: db.ref(`admins/${username}/execute/process`),
      queue: db.ref(`admins/${username}/execute/queue`),
      requests: db.ref(`admins/${username}/execute/requests`),

      profilePending: db.ref(`admins/${username}/execute/pending/${accountName}`),
      profileProcess: db.ref(`admins/${username}/execute/process/${accountName}`),
      profileQueue: db.ref(`admins/${username}/execute/queue/${accountName}`),
      profileRequests: db.ref(`admins/${username}/execute/requests/${accountName}`),

      profileSettings: db.ref(`admins/${username}/profiles/settings/${accountName}`),
      profileName: db.ref(`admins/${username}/profiles/names/${accountName}`),
      profilePoints: db.ref(`admins/${username}/profiles/points/${accountName}`),
      totalPoints: db.ref(`admins/${username}/profiles/points/${accountName}/total`),
      todayPoints: db.ref(`admins/${username}/profiles/points/${accountName}/${yy}/${mm}/${dd}`),
   }
}


/* ----  local storage set and get ---- */
function setDataFromLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

function getDataFromLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

function reloadLocation() {
   window.location.reload();
}

function setDataToLocalStorage(key, object, fun = () => {}) {
   return new Promise((resolve) => {
      const data = JSON.stringify(object);
      localStorage.setItem(key, data);
      if (typeof fun === "function") fun();
      resolve(data);
   })
}
function getDataToLocalStorage(key, fun = () => {}) {
   return new Promise((resolve) => {
      const data = JSON.parse(localStorage.getItem(key));
      if (typeof fun === "function") fun(data);
      resolve(data);
   });
}

function OBJECTtoJSON(data) {
   return JSON.stringify(data);
}
function JSONtoOBJECT(data) {
   return JSON.parse(data);
}

function getFormatTime(t) {
   const date = new Date(0);
   date.setSeconds(t);
   return date.toISOString().substr(11, 8);
}

function runtimeSendMessage(type, message, callback) {
   chrome.runtime.sendMessage({ ...message, type }, (response) => {
      callback && callback(response);
   });
}

/**
 * @param {number} ms
 **/
function wait(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} numberString
 * @return {number} number
 **/
function N(numberString) {
   return parseInt(numberString);
}

const debounce = (func, delayFn) => {
   let debounceTimer;
   return function (...args) {
      const context = this;
      const delay = delayFn();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
   };
};

function setInputLikeHuman(element) {
   const event = new Event("change", { bubbles: true });
   element.dispatchEvent(event);
}

function asyncHandler(callback) {
   try {
      callback();
   } catch (error) {
      console.error(error);
      showAlert({ message: error.message, title: `ERROR`, btnText: "Okay" });
   }
}

async function hashPassword(
   password,
   salt = crypto.getRandomValues(new Uint8Array(16))
) {
   const enc = new TextEncoder();
   const passwordData = enc.encode(password);
   const saltedPassword = new Uint8Array([...salt, ...passwordData]);

   const hashBuffer = await crypto.subtle.digest("SHA-256", saltedPassword);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
   const saltHex = Array.from(salt)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

   return { salt: saltHex, hash: hashHex };
}

async function verifyPassword(inputPassword, hashedPassword, saltHex) {
   const salt = new Uint8Array(
      saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
   );
   const { hash } = await hashPassword(inputPassword, salt);
   return hash === hashedPassword;
}

// ----- ----- ----- example ----- ----- -----
// (async () => {
//    const { hash, salt } = await hashPassword("password");
//    console.log(hash, salt);

//    const is = await verifyPassword("Password", hash, salt);
//    console.log(is);
// })();

function CE(first, ...children) {
   let element;

   if (first instanceof Node) {
      element = document.createElement("div");
      element.appendChild(first);
   } else if (typeof first === "object" && first !== null) {
      const tag = first.tag || "div";
      element = document.createElement(tag);

      for (const [attr, value] of Object.entries(first)) {
         if (attr !== "tag") {
            element.setAttribute(attr, value);
         }
      }
   } else if (typeof first === "string" || typeof first === "number") {
      element = document.createElement("div");
      element.innerText = first;
   }

   children.forEach((child) => {
      if (typeof child === "string" || typeof child === "number") {
         element.innerText = child;
      } else if (child instanceof Node) {
         element.appendChild(child);
      }
   });

   element.parent = (parent) => {
      if (parent) {
         parent.appendChild(element);
      }
   };

   return element;
}

/* 
   ---Example 1: Create a simple <div> element and append it to the body
   const div = CE({});
   document.body.appendChild(div);

   ---Example 2: Create a <p> element with text content and append it to the body
   const p = CE({ tag: 'p' }, 'Hello, world!');
   document.body.appendChild(p); 

   ---Example 3: Create an <img> element with attributes and append it to the body
   const img = CE({ tag: 'img', src: 'image.jpg', alt: 'Image' });
   document.body.appendChild(img);

   ---Example 4: Create a <div> with a <span> child element and append it to the body
   const span = document.createElement('span');
   span.textContent = 'Child Element';
   const divWithChild = CE({ tag: 'div' }, span);
   document.body.appendChild(divWithChild); 
*/

function date() {
   const date = new Date();
   const yy = date.getFullYear();
   const mm = date.getMonth() + 1;
   const dd = date.getDate();
   return { yy, mm, dd };
}

function arrayToObject(arr) {
   const obj = {};
   arr.forEach((e) => {
      obj[e] = Date.now();
   });
   return obj;
}

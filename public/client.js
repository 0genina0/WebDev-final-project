//const { createElement } = require("react");

let loggedIn = false;
const body = document.querySelector("body");
console.log("client script loaded!!");
let selectOption = document.getElementById("filter");

let isSorted = false;

// Function in order to clear the UlList
function reDrawList() {
  const venueList = document.getElementById("venueUl");
  if (venueList) {
    venueList.innerHTML = "";
  }
}

// Function to draw the full list
function drawFullList(data) {
    reDrawList();
    let venueList = document.getElementById('venueUl');

    data.forEach((store) => { 
        let newStore = document.createElement("li");

        let newStoreName = document.createElement("span");
        newStoreName.textContent = store.name + "";

        let newStoreLink = document.createElement("a");
        newStoreLink.href = store.url;
        newStoreLink.textContent = "Visit Website";

        let newStoreDistrict = document.createElement("span");
        newStoreDistrict.textContent = `(${store.district ?? "Unknown"})`;

        newStore.appendChild(newStoreName);

        newStore.appendChild(newStoreDistrict);

        newStore.appendChild(newStoreLink);

         // Buttons that show only when you are logged in
        if (loggedIn) {

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteStore(store.id));
            newStore.appendChild(deleteButton);

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editStores(store));
            newStore.appendChild(editButton);
        }

        venueList.appendChild(newStore);
})}

// FUnction to draw the sorted list by district
function drawSortedList(data) {
    reDrawList();
    let venueList = document.getElementById('venueUl');
    const selectedDistrict = selectOption.value;

    const filtered = data.filter(store => store.district === selectedDistrict);

        filtered.forEach((store) => {
          let newStore = document.createElement("li");

        let newStoreName = document.createElement("span");
        newStoreName.textContent = store.name + "";

        let newStoreLink = document.createElement("a");
        newStoreLink.href = store.url;
        newStoreLink.textContent = "Visit Website";

        let newStoreDistrict = document.createElement("span");
        newStoreDistrict.textContent = `(${store.district})`;

        newStore.appendChild(newStoreName);

        newStore.appendChild(newStoreDistrict);

        newStore.appendChild(newStoreLink);

         // Buttons that only show when logged in
        if (loggedIn) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteStore(store.id));
            newStore.appendChild(deleteButton);

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editStores(store));
            newStore.appendChild(editButton);
        }

        venueList.appendChild(newStore);
})}

// Check the status before redrawing the list
// fetch("/api/status", { credentials: "include" })
//   .then(r => r.json())
//   .then(s => {
//     loggedIn = s.loggedIn;

//      if (loggedIn) {
//         authButton.textContent = "Logout";
//         authButton.addEventListener("click", logoutUser);
//       } else {
//         authButton.textContent = "Login";
//         authButton.addEventListener("click", () => {
//           window.location.href = "/login";
//         });
//       }

//     loadStores();
//   });

// Create element fucntion
function createNewStores () {

    if (loggedIn) {
       let newStoreForm = document.getElementById("newstoreform");
       if (!newStoreForm) return;
       newStoreForm.innerHTML = '';

            let addStoreName = document.createElement("input");
            addStoreName.placeholder = "Name";

            let addStoreDistrict = document.createElement("input");
            addStoreDistrict.placeholder = "District";

            let addStoreUrl = document.createElement("input");
            addStoreUrl.placeholder = "Url";

            let addNewStoreEl = document.createElement("button");
            addNewStoreEl.type = "button";
            addNewStoreEl.textContent = "Add";

            newStoreForm.appendChild(addStoreName);
            newStoreForm.appendChild(addStoreDistrict);
            newStoreForm.appendChild(addStoreUrl);
            newStoreForm.appendChild(addNewStoreEl);
        
            addNewStoreEl.addEventListener("click", async () => {
            await createNewStore(
              addStoreName.value,
              addStoreUrl.value,
              addStoreDistrict.value
            );
            loadStores();
          });
    }
}

// Refreshes after CRUD
function loadStores() {
  fetch("/api/stores", { credentials: "include" })
    .then(r => r.json())
    .then(data => {
        createNewStores();

       if (selectOption.value === "All") {
            drawFullList(data);
        } else {
            drawSortedList(data);
        }
    });
}

//CREATE NEW STORE
async function createNewStore(name, url, district) {
  const res = await fetch("/api/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, url, district })
  });

  if (!res.ok) throw new Error("Store not added");
  return res.json();
}

// EDIT AND DELETE functions
async function deleteStore(id) {
  const res = await fetch(`/api/stores/${id}`, { method: "DELETE", credentials: "include", });
  if (!res.ok) return alert("Delete failed (are you logged in?)");
  loadStores(); // redraw
}

async function editStores(store) {
  const name = prompt("New name:", store.name);
  const url = prompt("New url:", store.url);
  const district = prompt("New district:", store.district);

  const res = await fetch(`/api/stores/${store.id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, url, district }),
  });

  if (!res.ok) return alert("Edit failed");
  loadStores();
}

// Logout function
async function logoutUser() {
  await fetch("/api/logout", {
    method: "POST",
    credentials: "include",
  });

  window.location.reload(); // refresh page
}
    
// Fetching and displaying the list through a boolean from the JSON file  
if (selectOption) {  
    // Create the button for the LogIn
  const logInButton = document.createElement("button");
  body.appendChild(logInButton);

  // Check login status
  fetch("/api/status", { credentials: "include" })
    .then(res => res.json())
    .then(data => {

      loggedIn = data.loggedIn;

      if (loggedIn) {
        logInButton.textContent = "Logout";
        logInButton.addEventListener("click", logoutUser);
      } else {
        logInButton.textContent = "Login";
        logInButton.addEventListener("click", () => {
          window.location.href = "/login";
        });
      }

      loadStores(); // draw stores after login state is known
    });

  // Filter
  selectOption.addEventListener("change", loadStores);
}

// LOG IN Form
const loginForm = document.getElementById("loginForm");
const submit = document.getElementById("submit");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) =>{
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const res = await fetch("/login", {
            method: "POST",
            credentials: "include", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password})
        });

        if (!res.ok){
            loggedIn = false;
            return;
        }

        loggedIn = true;
        window.location.href = "/";
    })
}
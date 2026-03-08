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

// ONE function to rule them all
function renderStores(data) {
  reDrawList();
  const venueList = document.getElementById('venueUl');

  data.forEach((store) => { 
      const li = document.createElement("li");
      
      // Use the ID from the database for the delete/edit calls
      li.innerHTML = `
          <span>${store.name}</span>
          <span>(${store.district ?? "Unknown"})</span>
          <a href="${store.url}">Visit Website</a>
          <span>There are ${store.visitors} visitors.</span>
          <span>The venue is: ${store.store_status}.</span>
      `;

      if (loggedIn) {
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.onclick = () => deleteStore(store.id);

          const editBtn = document.createElement("button");
          editBtn.textContent = "Edit";
          editBtn.onclick = () => editStores(store);

          li.appendChild(deleteBtn);
          li.appendChild(editBtn);
      }
      venueList.appendChild(li);
  });
}

function loadStores() {
  const district = selectOption.value;
  
  // Using the template literal for the district
  const url = (district === "All") ? "/api/stores" : `/api/stores?district=${district}`;

  fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
          createNewStores();
          renderStores(data); // Just draw whatever the server sent
      });
}

// // Function to draw the full list
// function drawFullList(data) {
//     reDrawList();
//     let venueList = document.getElementById('venueUl');

//     data.forEach((store) => { 
//         let newStore = document.createElement("li");

//         let newStoreName = document.createElement("span");
//         newStoreName.textContent = store.name + "";

//         let newStoreLink = document.createElement("a");
//         newStoreLink.href = store.url;
//         newStoreLink.textContent = "Visit Website";

//         let newStoreDistrict = document.createElement("span");
//         newStoreDistrict.textContent = `(${store.district ?? "Unknown"})`;

//         newStore.appendChild(newStoreName);

//         newStore.appendChild(newStoreDistrict);

//         newStore.appendChild(newStoreLink);

//          // Buttons that show only when you are logged in
//         if (loggedIn) {

//             const deleteButton = document.createElement("button");
//             deleteButton.textContent = "Delete";
//             deleteButton.addEventListener("click", () => deleteStore(store.id));
//             newStore.appendChild(deleteButton);

//             const editButton = document.createElement("button");
//             editButton.textContent = "Edit";
//             editButton.addEventListener("click", () => editStores(store));
//             newStore.appendChild(editButton);
//         }

//         venueList.appendChild(newStore);
// })}

// // FUnction to draw the sorted list by district
// function drawSortedList(data) {
//     reDrawList();
//     let venueList = document.getElementById('venueUl');
//     const selectedDistrict = selectOption.value;

//     const filtered = data.filter(store => store.district === selectedDistrict);

//         filtered.forEach((store) => {
//           let newStore = document.createElement("li");

//         let newStoreName = document.createElement("span");
//         newStoreName.textContent = store.name + "";

//         let newStoreLink = document.createElement("a");
//         newStoreLink.href = store.url;
//         newStoreLink.textContent = "Visit Website";

//         let newStoreDistrict = document.createElement("span");
//         newStoreDistrict.textContent = `(${store.district})`;

//         newStore.appendChild(newStoreName);

//         newStore.appendChild(newStoreDistrict);

//         newStore.appendChild(newStoreLink);

//          // Buttons that only show when logged in
//         if (loggedIn) {
//             const deleteButton = document.createElement("button");
//             deleteButton.textContent = "Delete";
//             deleteButton.addEventListener("click", () => deleteStore(store.id));
//             newStore.appendChild(deleteButton);

//             const editButton = document.createElement("button");
//             editButton.textContent = "Edit";
//             editButton.addEventListener("click", () => editStores(store));
//             newStore.appendChild(editButton);
//         }

//         venueList.appendChild(newStore);
// })}



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

            let addStoreVisitors = document.createElement("input");
            addStoreVisitors.placeholder = "Visitors";

            let addStoreStatus = document.createElement("input");
            addStoreStatus.placeholder = "Store Status";

            let addNewStoreEl = document.createElement("button");
            addNewStoreEl.type = "button";
            addNewStoreEl.textContent = "Add";

            newStoreForm.appendChild(addStoreName);
            newStoreForm.appendChild(addStoreDistrict);
            newStoreForm.appendChild(addStoreUrl);
            newStoreForm.appendChild(addNewStoreEl);
            newStoreForm.appendChild(addStoreVisitors);
            newStoreForm.appendChild(addStoreStatus);
        
            addNewStoreEl.addEventListener("click", async () => {
            await createNewStore(
              addStoreName.value,
              addStoreUrl.value,
              addStoreDistrict.value,
              addStoreVisitors.value,
              addStoreStatus.value
            );
            loadStores();
          });
    }
}

// Refreshes after CRUD
// function loadStores() {
//   const district = selectOption.value

//   fetch("/api/stores", { credentials: "include" })
//     .then(r => r.json())
//     .then(data => {
//         createNewStores();

//        if (selectOption.value === "All") {
//             drawFullList(data);
//         } else {
//             drawSortedList(data);
//         }
//     });
// }

//CREATE NEW STORE
async function createNewStore(name, url, district, visitors, store_status) {
  const res = await fetch("/api/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, url, district, visitors, store_status })
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
  const visitors = prompt("New visitors amount:", store.visitors);
  const store_status = prompt("New store status:", store.store_status)

  const res = await fetch(`/api/stores/${store.id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, url, district, visitors, store_status }),
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
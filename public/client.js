let loggedIn = false;
const body = document.querySelector("body");
console.log("client script loaded!!");
let selectOption = document.getElementById("filter");

let isSorted = false;

// Function in order to clear the UlList before the table is displayed
function reDrawList() {
  const venueList = document.getElementById("venueUl");
  if (venueList) {
    venueList.innerHTML = "";
  }
}

// function to display the stores
function renderStores(data) {
  reDrawList();
  const venueList = document.getElementById('venueUl');

  data.forEach((store) => { 
      const li = document.createElement("li");
      
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

// redrawing the table after the CRUD
function loadStores() {
  const district = selectOption.value;

  // variable for sorting
  const url = (district === "All") ? "/api/stores" : `/api/stores?district=${district}`;

  fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
          createNewStores();
          renderStores(data);
      });
}

// The form for adding a new store
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
            newStoreForm.appendChild(addStoreVisitors);
            newStoreForm.appendChild(addStoreStatus);
            newStoreForm.appendChild(addNewStoreEl);
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

//CREATE NEW STORE - updating the dataset
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

//DELETE function
async function deleteStore(id) {
  const res = await fetch(`/api/stores/${id}`, { method: "DELETE", credentials: "include", });
  if (!res.ok) return alert("Delete failed (are you logged in?)");
  loadStores(); // redraw
}

// EDIT function
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

// if slectOption is true then run this code
if (selectOption) {  
  //making the button to log in
  const logInButton = document.createElement("button");
  logInButton.className = "login-btn"; 
  header.appendChild(logInButton);

  // checking the log in status
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
        // This line of code was done with the help of this source: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        // Was added to stop the default refreshing that happened after submition
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // it await an answer from the backend wherther the username and pass are correct otherwise it will run immediately
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
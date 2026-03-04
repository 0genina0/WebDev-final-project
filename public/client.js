let loggedIn = false;
const body = document.querySelector("body");
console.log("client script loaded!!");
let selectOption = document.getElementById("filter");

let isSorted = false;
let listDrawn = false;

let loginPageButton = document.createElement("button");
loginPageButton.textContent = "login";
body.appendChild(loginPageButton);

loginPageButton.addEventListener("click", ()=> {
    window.location.href = "/login";
})

// Function in order to clear the UlList
function reDrawList() {
  const venueList = document.getElementById("venueUl");
  venueList.innerHTML = "";
  listDrawn = false;
}

// Function to draw the full list
function drawFullList(data) {
    reDrawList();
    listDrawn = true;
    let venueList = document.getElementById('venueUl');

    data.forEach((store) => { 

        let newStore = document.createElement("li");

        newStore.textContent = store.name;

        let newStoreLink = document.createElement("a");

        newStoreLink.href = store.url;
        newStoreLink.textContent = "Visit Website";

        let newStoreDistrict = document.createElement("span");

        newStoreDistrict.textContent = store.district;

        venueList.appendChild(newStore);

        venueList.appendChild(newStoreDistrict);

        venueList.appendChild(newStoreLink);
})}

// FUnction to draw the sorted list by district
function drawSortedList(data) {
    //listDrawn = true;
    reDrawList();
    let venueList = document.getElementById('venueUl');
    const selectedDistrict = selectOption.value;

    const filtered = data.filter(store => store.district === selectedDistrict);

        filtered.forEach((store) => {
            let sortedStore = document.createElement("li");
        
            sortedStore.textContent = store.name;
        
            let sortedStoreLink = document.createElement("a");
        
            sortedStoreLink.href = store.url;
            sortedStoreLink.textContent = "Visit Website";
        
            let sortedStoreDistrict = document.createElement("span");
        
            sortedStoreDistrict.textContent = store.district;
        
            venueList.appendChild(sortedStore);
        
            venueList.appendChild(sortedStoreDistrict);
        
            venueList.appendChild(sortedStoreLink);  
})}
    
// Fetching and displaying the list through a boolean from the JSON file
fetch('/api/stores')
    .then(response => response.json())
    .then(data => {
    drawFullList(data);
        selectOption.addEventListener('change', ()=>{
            reDrawList();
        if (selectOption.value === "All"){
        drawFullList(data);
      } else {
        drawSortedList(data);
      }
    })
});

// LOG IN Form
const loginForm = document.getElementById("loginForm");
const submit = document.getElementById("submit");

loginForm.addEventListener("submit", async (e) =>{
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password})
    });

    if (!res.ok){
        loggedIn = false;
        return;
    }

    loggedIn = true;
})
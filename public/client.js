let loggedIn = false;
let body = document.querySelector("body");
console.log("client script loaded!!");
let selectOption = document.getElementById("filter");


let loginPageButton = document.createElement("button");
loginPageButton.textContent = "login";
body.appendChild(loginPageButton);

loginPageButton.addEventListener("click", ()=> {
    window.location.href = "/login";
})

let isSorted = false;

function drawFullList() {
    let venueList = document.getElementById('venueUl');

    fetch('/api/stores')
    .then(response => response.json())
    .then(data => {

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
        })})

}

function drawSortedList() {
    fetch('/api/stores')
            .then(response => response.json())
            .then(data => {
                data.forEach((store) => {
                    selectOption.addEventListener('change', ()=>{
            
                    let venueList = document.getElementById('venueUl');
                    if (selectOption.value === store.district){
                    let sortedStore = document.createElement("li");
        
                    sortedStore.textContent = store.name;
        
                    let sortedStoreLink = document.createElement("a");
        
                    sortedStoreLink.href = store.url;
                    sortedStoreLink.textContent = "Visit Website";
        
                    let sortedStoreDistrict = document.createElement("span");
        
                    sortedStoreDistrict.textContent = store.district;
        
                    venueList.appendChild(sortedStore);
        
                    venueList.appendChild(sortedStoreDistrict);
        
                    venueList.appendChild(sortedStoreLink);  }})
    
            
             

})})}


fetch('/api/stores')
    .then(response => response.json())
    .then(data => {
        console.log("Stores received from server:", data);
        selectOption.addEventListener('change', ()=>{
            isSorted = true;
        })
        if (isSorted = true){
            
            drawSortedList();
        } else if (isSorted = false){
            drawFullList();
        }
    })
    




/// prettier break

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


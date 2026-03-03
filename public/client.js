let loggedIn = false;

console.log("client script loaded!!");


fetch('/api/stores')
    .then(response => response.json())
    .then(data => {
        console.log("Stores received from server:", data);

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

        }); 
    
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
    const data = await res.json();

    if (!res.ok){
        loggedIn = false;
        return;
    }

    loggedIn = true;
    


})


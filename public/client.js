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





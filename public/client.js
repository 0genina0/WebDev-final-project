console.log("client script loaded!!");

fetch('/api/stores')
    .then(response => response.json())
    .then(data => {
        console.log("Stores received from server:", data);

        let venueList = document.getElementById('venueUl');

        data.forEach((store) => { 

            let newStore = document.createElement("li");

            newStore.textContent = store.name;
            venueList.appendChild(newStore);
        }); 
    }) 





document.addEventListener('DOMContentLoaded', function() {
    // Retrieve reservation data from localStorage
    var reservations = JSON.parse(localStorage.getItem('reservations')) || [];

    // Get the table body element
    var tableBody = document.querySelector('tbody');

    reservations.forEach(function(reservation, index) {
        // Create a new row for each reservation
        var newRow = tableBody.insertRow();
        newRow.insertCell().textContent = index + 1; // Reservation ID
        newRow.insertCell().textContent = reservation.rusername; // Restaurant Name
        newRow.insertCell().textContent = reservation.username; // Username/Email
        newRow.insertCell().textContent = reservation.date; // Date
        newRow.insertCell().textContent = reservation.time; // Time
        newRow.insertCell().textContent = reservation.number; // Guests
        newRow.insertCell().textContent = reservation.status; // Status
    });
});


function makeReservationAgain(detailsUrl) {
    window.location.href = detailsUrl;
}



// List reservations for the current user
document.addEventListener('DOMContentLoaded', function() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const acceptedRestaurants = JSON.parse(localStorage.getItem('acceptedRestaurants')) || [];
    const username = localStorage.getItem('username');
    const reservationList = document.getElementById('reservation-list');

    let reservationHTML = '';
    let modalIndex = 1;

    reservations.forEach((reservation) => {
        if (reservation.username === username) {
            const restaurant = acceptedRestaurants.find(r => r.email === reservation.rusername);
            if (restaurant) {
                const detailsUrl = `details.html?id=${restaurant.id}`;
                reservationHTML += `
                    <div class="reservation-card">
                        <img src="${restaurant.logoUrl}" alt="${restaurant.name}">
                        <div class="reservation-details">
                            <h2> ${restaurant.name}</h2>
                            <p>Status: ${reservation.status}</p>
                            <p>Date: ${reservation.date}</p>
                            <p>Time: ${reservation.time}</p>
                            <p>Guests: ${reservation.number}</p>
                            <button onclick="makeReservationAgain('${detailsUrl}')">Make Reservation Again</button>
                        </div>
                    </div>
                `;
            }
        }
    });

    reservationList.innerHTML = reservationHTML;
});

 
window.addEventListener('message', function(event) {
    if (event.data.type === 'updateTable') {
        updateTable();
    }
});

function updateTable() {
    // Retrieve reservation data from localStorage
    var reservations = JSON.parse(localStorage.getItem('reservations')) || [];

    // Display reservation data in the table
    var tableBody = document.getElementById('reservation-details');
    tableBody.innerHTML = ''; // Clear existing table rows
    var username = localStorage.getItem('username');
    var defaultStatus = 'Pending'; 
    var filteredReservations = reservations.filter(reservation => reservation.rusername === username);

    filteredReservations.forEach(function(reservation) {
        var newRow = tableBody.insertRow();
        newRow.insertCell().textContent = reservation.status; 
        newRow.insertCell().textContent = reservation.username;
        newRow.insertCell().textContent = reservation.number;
        newRow.insertCell().textContent = reservation.date;
        newRow.insertCell().textContent = reservation.time;

        // Add action buttons for confirm, decline, and remove reservation
        var actionCell = newRow.insertCell();

        // Confirm button
        var confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm';
        confirmButton.classList.add('confirm'); // Add class for styling
        confirmButton.onclick = function() {
            reservation.status = 'Confirmed';
            localStorage.setItem('reservations', JSON.stringify(reservations));
            newRow.cells[0].textContent = 'Confirmed'; // Update status cell
            console.log('Reservation confirmed:', reservation);

            // Remove all buttons
            removeAllButtons();
        };
        actionCell.appendChild(confirmButton);

        // Decline button
        var declineButton = document.createElement('button');
        declineButton.textContent = 'Decline';
        declineButton.classList.add('decline'); // Add class for styling
        declineButton.onclick = function() {
            reservation.status = 'Declined';
            localStorage.setItem('reservations', JSON.stringify(reservations));
            newRow.cells[0].textContent = 'Declined'; // Update status cell
            console.log('Reservation declined:', reservation);

            // Remove both confirm and decline buttons
            removeButtons();

            // Show the "Remove Reservation" button
            removeButton.style.display = 'block';
        };
        actionCell.appendChild(declineButton);

        // Add "Remove Reservation" button
        var removeButton = document.createElement('button');
        removeButton.textContent = 'Remove Reservation';
        removeButton.style.display = 'none'; // Initially hide the button
        removeButton.onclick = function() {
            var index = reservations.indexOf(reservation);
            if (index !== -1) {
                reservations.splice(index, 1);
                localStorage.setItem('reservations', JSON.stringify(reservations));
                tableBody.removeChild(newRow); // Remove row from the table
                console.log('Reservation removed:', reservation);
            }
        };
        actionCell.appendChild(removeButton);

        // Function to remove confirm and decline buttons
        function removeButtons() {
            actionCell.removeChild(confirmButton);
            actionCell.removeChild(declineButton);
        }

        // Function to remove all buttons
        function removeAllButtons() {
            removeButtons(); // Remove confirm and decline buttons
            actionCell.removeChild(removeButton); // Remove the remove button
        }

        // Check the reservation status to decide whether to add buttons
        if (reservation.status === 'Confirmed'){
            removeAllButtons();
            removeButton.style.display = 'block';
        } 
        if(reservation.status === 'Declined') {
            removeButtons();
            removeButton.style.display = 'block';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form#reservation-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Collect form data
        const formData = {
            username: localStorage.getItem('username'),
            number: document.getElementById('number').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value
        };
     
        // Retrieve existing reservations from localStorage or initialize an empty array
        let reservations = JSON.parse(localStorage.getItem('reservations')) || [];

        // Add the new reservation to the array
        reservations.push(formData);

        // Save the updated reservations array to localStorage
        localStorage.setItem('reservations', JSON.stringify(reservations));

        // Clear the form fields
        document.getElementById('number').value = '';
        document.getElementById('date').value = '';
        document.getElementById('time').value = '';

        // Trigger an event to inform the other HTML page to update the table
        window.parent.postMessage({ type: 'updateTable' }, '*');
    });
});

// Initial update of the table
updateTable();
document.getElementById('reserve-button').addEventListener('click', function() {
    window.location.href = 'Resturants.html';
});
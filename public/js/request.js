   // Retrieve users, accepted restaurants, and request form data from local storage
   var users = JSON.parse(localStorage.getItem('users')) || [];
   var acceptedRestaurants = JSON.parse(localStorage.getItem('acceptedRestaurants')) || [];
   var requestFormData = JSON.parse(localStorage.getItem('requestFormData')) || [];

   document.addEventListener('DOMContentLoaded', function() {
       const form = document.querySelector('form');
       form.addEventListener('submit', function(event) {
           event.preventDefault(); // Prevent the default form submission

           var name = document.getElementById('name').value;
           var email = document.getElementById('email').value.toLowerCase();
           var password = document.getElementById('password').value;
           var phone = document.getElementById('phone').value;
           var location = document.getElementById('location').value;
           var openingTime = document.getElementById('opening-time').value;
           var closingTime = document.getElementById('closing-time').value;
           var description = document.getElementById('description').value;
           var category = document.getElementById('category').value;
           var menuUrl = document.getElementById('menu-url').value;
           var locationUrl = document.getElementById('location-url').value;
           var logoUrl = document.getElementById('logo-url').value;
           var photoUrl = document.getElementById('photo-url').value;

           // Check if email already exists in users, acceptedRestaurants, or requestFormData
           var emailExistsInUsers = users.some(function(user) {
               return user.email === email;
           });
           var emailExistsInAcceptedRestaurants = acceptedRestaurants.some(function(restaurant) {
               return restaurant.email === email;
           });
           var emailExistsInRequestFormData = requestFormData.some(function(request) {
               return request.email === email;
           });

           // Show error message if email exists in any of the arrays
           var emailError = document.getElementById('emailError');
           if (emailExistsInUsers || emailExistsInAcceptedRestaurants || emailExistsInRequestFormData) {
               emailError.style.display = 'block';
               return;
           } else {
               emailError.style.display = 'none';
           }

           // Create a new request object
           var formData = {
               name: name,
               email: email,
               password: password,
               phone: phone,
               location: location,
               openingTime: openingTime,
               closingTime: closingTime,
               description: description,
               category: category,
               menuUrl: menuUrl,
               locationUrl: locationUrl,
               logoUrl: logoUrl,
               photoUrl: photoUrl
           };

           // Add the new formData to the requests array
           requestFormData.push(formData);
           // Store updated array in localStorage
           localStorage.setItem('requestFormData', JSON.stringify(requestFormData));

           // Increment the request count
           let requestCount = parseInt(localStorage.getItem('requestCount')) || 0;
           requestCount++;
           localStorage.setItem('requestCount', requestCount);

           // Redirect to the sign-in page
           window.location.href = 'signin.html';
       });
   });




document.addEventListener('DOMContentLoaded', function() {
    const requestsContainer = document.getElementById('request-list');
    const requests = JSON.parse(localStorage.getItem('requestFormData')) || [];

    requests.forEach((request, index) => {
        const requestDiv = document.createElement('div');
        requestDiv.innerHTML = `
            <h2>Request ${index + 1}</h2>
            <p>Name: ${request.name}</p>
            <p>Email: ${request.email}</p>
            <p>Phone: ${request.phone}</p>
            <p>Location: ${request.location}</p>
            <p>Opening Time: ${request.openingTime}</p>
            <p>Closing Time: ${request.closingTime}</p>
            <p>Description: ${request.description}</p>
            <p>Category: ${request.category}</p>
            <p>Menu URL: <a href="${request.menuUrl}">${request.menuUrl}</a></p>
            <p>Location URL: <a href="${request.locationUrl}">${request.locationUrl}</a></p>
            <p>Logo URL: <a href="${request.logoUrl}">${request.logoUrl}</a></p>
            <p>Photo URL: <a href="${request.photoUrl}">${request.photoUrl}</a></p>
            <button onclick="acceptRequest(${index})">Accept</button>
            <button onclick="declineRequest(${index})">Decline</button>
            <hr>`;
        requestsContainer.appendChild(requestDiv);
    });
});

function acceptRequest(index) {
    let requests = JSON.parse(localStorage.getItem('requestFormData')) || [];
    let accepted = JSON.parse(localStorage.getItem('acceptedRestaurants')) || [];
    
    // Assuming request at 'index' is the one to accept
    const acceptedRequest = requests.splice(index, 1)[0];
    accepted.push({
        id: acceptedRequest.email.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(), // creating a simple id from email
        name: acceptedRequest.name,
        email: acceptedRequest.email,
        password: acceptedRequest.password,
        phone: acceptedRequest.phone,
        location: acceptedRequest.location,
        openingTime: acceptedRequest.openingTime,
        closingTime: acceptedRequest.closingTime,
        description: acceptedRequest.description,
        category: acceptedRequest.category,
        menuUrl: acceptedRequest.menuUrl,
        locationUrl: acceptedRequest.locationUrl,
        logoUrl: acceptedRequest.logoUrl,
        photoUrl: acceptedRequest.photoUrl
    });
    

    // Update localStorage
    localStorage.setItem('requestFormData', JSON.stringify(requests));
    localStorage.setItem('acceptedRestaurants', JSON.stringify(accepted));

    // Optionally reload or update the page content
    location.reload();
}




function declineRequest(index) {
    let requests = JSON.parse(localStorage.getItem('requestFormData')) || [];

    // Remove the declined request from the requests array
    requests.splice(index, 1);

    // Update local storage
    localStorage.setItem('requestFormData', JSON.stringify(requests));

    // Optionally reload or update the page content
    location.reload();
}

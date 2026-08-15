console.log("JS LOADED");

// Toggle between User and Host login tabs
function switchAuthTab(type) {
    const userForm = document.getElementById('userform');
    const hostForm = document.getElementById('hostform');
    const userTabBtn = document.getElementById('userTabBtn');
    const hostTabBtn = document.getElementById('hostTabBtn');

    if (type === 'host') {
        userForm.style.display = 'none';
        hostForm.style.display = 'block';
        userTabBtn.classList.remove('active');
        hostTabBtn.classList.add('active');
    } else {
        hostForm.style.display = 'none';
        userForm.style.display = 'block';
        hostTabBtn.classList.remove('active');
        userTabBtn.classList.add('active');
    }
}
// Safe Host Login
// ==========================================
const hostLoginForm = document.getElementById('hostform');
if (hostLoginForm) {
    hostLoginForm.addEventListener("submit", function(event) {   
        event.preventDefault();
        
        const usernameEl = document.getElementById('hostUsername');
        const passwordEl = document.getElementById('hostPassword');

        // Stop if inputs are missing from the HTML
        if (!usernameEl || !passwordEl) {
            console.error("Missing hostUsername or hostPassword input in HTML!");
            return;
        }

        const username = usernameEl.value.trim();
        const password = passwordEl.value;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        const host = users.find(
            h => h.username === username && 
            h.password === password && 
            h.role === 'host'
        );

        if (!host) {
            const errorEl = document.getElementById('hostLoginMessage');
            if (errorEl) {
                errorEl.textContent = "Invalid username or password!"; 
                errorEl.style.color = "red"; 
            }
            return;
        }
        
        localStorage.setItem('loggedInUser', JSON.stringify(host));
        window.location.href = "manage-listings.html";

    });
}

//User Login
const userLoginForm = document.getElementById('userform');
if (userLoginForm) {
    userLoginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const usernameEl = document.getElementById('userUsername');
        const passwordEl = document.getElementById('userPassword');

        // Stop if inputs are missing from the HTML
        if (!usernameEl || !passwordEl) {
            console.error("Missing userUsername or userPassword input in HTML!");
            return;
        }

        const username = usernameEl.value.trim();
        const password = passwordEl.value;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        const user = users.find(
            u => u.username === username && 
            u.password === password && 
            u.role === 'user'
        );
            
        if (!user) {
            const errorEl = document.getElementById('userLoginMessage');
            if (errorEl) {
                errorEl.textContent = "Invalid username or password!";  
                errorEl.style.color = "red";
            }
            return;
        }

        localStorage.setItem('loggedInUser', JSON.stringify(user));
        
        const successEl = document.getElementById('userLoginMessage');
        if (successEl) {
            successEl.textContent = "User login successful!";
            successEl.style.color = "green";
        }
        window.location.href = "listings.html";       
    });
}

// Registration button for host
const hostRegisterBtn = document.getElementById('hostRegisterBtn');
if (hostRegisterBtn) {
    hostRegisterBtn.addEventListener("click", function() {
        // Redirect to host registration page
        window.location.href = "host-register.html";
    });
}
const backToLoginBtn = document.getElementById('backToLoginBtn');
if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", function() {
        // Redirect to login page
        window.location.href = "index.html";
    });
}

// Registration button for user
const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
    registerBtn.addEventListener("click", function() {  
        // Redirect to user registration page
        window.location.href = "user-register.html"; 
    });
}

// User back to login page
const backBtn = document.getElementById('backBtn');
if (backBtn) {
    backBtn.addEventListener("click", function() {
        // Redirect to login page
        window.location.href = "index.html";
    });
}


// Host registration form submission
const hostForm = document.getElementById('hostRegistrationForm');
if (hostForm) {
    hostForm.addEventListener("submit", function(event) {
        event.preventDefault();

        // get password and confirm password values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // validate password and confirm password
        if (password !== confirmPassword) {
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.textContent = "Passwords do not match!";
                messageEl.style.color = "red";
            }
            return;
        }


        // get users from local storage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        const newHost = {
            id: Date.now(),
            username,
            password,
            role: 'host'
        };

        // add new host to users array
        users.push(newHost);
        localStorage.setItem('users', JSON.stringify(users));

        // add a message for successful registration
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = "Host registered successfully! Please log in.";
            messageEl.style.color = "green";
        }   
        setTimeout (function() {
            window.location.href = "index.html";
            }, 2000);

    });
}
    

// Save Email for host registration
const hostEmailInput = document.getElementById('email');
if (hostEmailInput) {
    hostEmailInput.addEventListener("input", function() {
        localStorage.setItem('hostEmail', hostEmailInput.value);
    });
}


// User registration form 

const userForm = document.getElementById('userRegistrationForm');
if (userForm) {
    userForm.addEventListener("submit", function(event) {
        event.preventDefault();

        // get password and confirm password values
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        // validate password and confirm password
        if (password !== confirmPassword) {
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.textContent = "Passwords do not match!";
                messageEl.style.color = "red";
            }
            return;
        }

        // get users from local storage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        const newUser = {
            id: Date.now(),
            username: document.getElementById('username').value,
            password: password,
            role: 'user'
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // add a message for successful registration
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = "User registered successfully! Please log in.";
            messageEl.style.color = "green";
        }
        setTimeout (function() {
            window.location.href = "index.html";
        }, 2000);

    });
}

// Save Email for user registration
const userEmailInput = document.getElementById('email');
if (userEmailInput) {
    userEmailInput.addEventListener("input", function() {
        localStorage.setItem('userEmail', userEmailInput.value);
    });
}


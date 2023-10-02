const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');
    function validatePassword() {
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;

        // Regular expression pattern for at least 8 characters and one uppercase letter
        const passwordPattern = /^(?=.*[A-Z]).{8,}$/;

        if (!passwordPattern.test(password)) {
            passwordField.setCustomValidity("Password must be at least 8 characters long and contain at least one uppercase letter.");
        } else if (password !== confirmPassword) {
            confirmPasswordField.setCustomValidity("Passwords do not match.");
        } else {
            confirmPasswordField.setCustomValidity('');
        }
    }

    passwordField.addEventListener('input', validatePassword);

    document.querySelector('form.registration-form').addEventListener('submit', (e) => {
        if (!passwordPattern.test(passwordField.value) || passwordField.value !== confirmPasswordField.value) {
            e.preventDefault(); // Prevent form submission
            // You can also display an error message to the user if needed
            alert("Please make sure your password meets the requirements.");
        }
    });

import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signin.css";

// Define form data structure
interface FormData {
    email: string;
    password: string;
}

// Define form errors structure
interface FormErrors {
    email: string;
    password: string;
}

function Signin() {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<FormErrors>({
        email: "",
        password: "",
    });

    const [loginError, setLoginError] = useState<string>("");

    const navigate = useNavigate(); // Initialize the navigate function from React Router

    // Hardcoded credentials
    const predefinedEmail = "user@example.com";
    const predefinedPassword = "password123";

    // Handle input changes
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Basic validation for email and password fields
    const validateForm = (): boolean => {
        let formValid = true;
        const errorsCopy: FormErrors = {
            email: "",
            password: "",
        };

        if (!formData.email.trim()) {
            formValid = false;
            errorsCopy.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            formValid = false;
            errorsCopy.email = "Email is invalid";
        }

        if (!formData.password) {
            formValid = false;
            errorsCopy.password = "Password is required";
        }

        setErrors(errorsCopy);
        return formValid;
    };

    // Handle form submission
    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (validateForm()) {
            // Check if the entered email and password match the hardcoded credentials
            if (formData.email === predefinedEmail && formData.password === predefinedPassword) {
                console.log("User signed in successfully");
                // Navigate to dashboard after successful login
                navigate("/create");
            } else {
                setLoginError("Invalid email or password.");
            }
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <h1>Sign In</h1>
                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? "error-input" : ""}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? "error-input" : ""}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {loginError && <p className="error-message">{loginError}</p>}

                    <button type="submit" className="signin-button">
                        Sign In
                    </button>
                </form>

                <p className="signup-redirect">
                    Don't have an account? <a href="/signup">Sign Up</a>
                </p>
            </div>
        </div>
    );
}

export default Signin;

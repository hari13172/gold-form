import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ref, update, set } from "firebase/database"; // Firebase methods for database
// @ts-ignore
import { database } from "../firebase"; // Import Firebase database
import '../styles/Form.css';
import Header from "./Header";

interface FormData {
    applicationNumber: string;
    username: string;
    address: string;
    goldGramWeight: string;
    amount: string;
    startDate: string;
    endDate: string;
    phoneNumber: string;
}

function Form() {
    const navigate = useNavigate();
    const location = useLocation();
    const { formData, isEdit } = location.state || {};   // Use formData and isEdit state passed from the Create component

    // Form state
    const [applicationNumber, setApplicationNumber] = useState<string>(formData?.applicationNumber || "");
    const [username, setUsername] = useState<string>(formData?.username || "");
    const [address, setAddress] = useState<string>(formData?.address || "");
    const [goldGramWeight, setGoldGramWeight] = useState<string>(formData?.goldGramWeight || "");
    const [amount, setAmount] = useState<string>(formData?.amount || "");
    const [startDate, setStartDate] = useState<string>(formData?.startDate || "");
    const [endDate, setEndDate] = useState<string>(formData?.endDate || "");
    const [phoneNumber, setPhoneNumber] = useState<string>(formData?.phoneNumber || "");

    const [errors, setErrors] = useState<string[]>([]);

    // Validate form fields
    const validateForm = (): boolean => {
        const newErrors: string[] = [];
        const regexPatterns = {
            applicationNumber: /^[A-Za-z0-9]+$/,
            username: /^[a-zA-Z\s]{3,}$/,
            address: /^.{10,}$/,
            goldGramWeight: /^\d+(\.\d{1,2})?$/,
            amount: /^\d+(\.\d{1,2})?$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            phoneNumber: /^[0-9]{10}$/
        };

        if (!regexPatterns.applicationNumber.test(applicationNumber)) {
            newErrors.push("Application number is invalid. Only alphanumeric characters are allowed.");
        }
        if (!regexPatterns.username.test(username)) {
            newErrors.push("Username must be at least 3 characters long and contain only letters and spaces.");
        }
        if (!regexPatterns.address.test(address)) {
            newErrors.push("Address must be at least 10 characters long.");
        }
        if (!regexPatterns.goldGramWeight.test(goldGramWeight)) {
            newErrors.push("Gold gram weight must be a valid number with up to 2 decimal places.");
        }
        if (!regexPatterns.amount.test(amount)) {
            newErrors.push("Amount must be a valid number with up to 2 decimal places.");
        }
        if (!regexPatterns.phoneNumber.test(phoneNumber)) {
            newErrors.push("Phone number must be a valid 10-digit number.");
        }
        if (!regexPatterns.date.test(startDate)) {
            newErrors.push("Start date is not valid. Use YYYY-MM-DD format.");
        }
        if (!regexPatterns.date.test(endDate)) {
            newErrors.push("End date is not valid. Use YYYY-MM-DD format.");
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (validateForm()) {
            const newFormData: FormData = {
                applicationNumber,
                username,
                address,
                goldGramWeight,
                amount,
                startDate,
                endDate,
                phoneNumber,
            };

            try {
                if (isEdit) {
                    // Update existing entry in Firebase (use `update` for editing)
                    const entryRef = ref(database as any, `/entries/${applicationNumber}`);
                    await update(entryRef, newFormData);
                } else {
                    // Create a new entry in Firebase (use `set` with a key to avoid duplicates)
                    const entryRef = ref(database as any, `/entries/${applicationNumber}`);
                    await set(entryRef, newFormData);
                }

                navigate("/create");

                // Optionally reset form fields after submission
                setApplicationNumber("");
                setUsername("");
                setAddress("");
                setGoldGramWeight("");
                setAmount("");
                setStartDate("");
                setEndDate("");
                setPhoneNumber("");

            } catch (error) {
                console.error("Error writing to Firebase: ", error);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="container">
                <form onSubmit={handleSubmit} className="form">
                    {/* Display validation errors */}
                    {errors.length > 0 && (
                        <div className="error-messages">
                            <ul>
                                {errors.map((error, index) => (
                                    <li key={index} className="error-text">{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Application Number</label>
                        <input
                            type="text"
                            value={applicationNumber}
                            onChange={(e) => setApplicationNumber(e.target.value)}
                            className="input"
                            disabled={isEdit} // Disable field when editing
                        />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Gold Gram Weight</label>
                        <input
                            type="number"
                            value={goldGramWeight}
                            onChange={(e) => setGoldGramWeight(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Starting Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Ending Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input"
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        {isEdit ? "Update" : "Submit"}
                    </button>
                </form>
            </div>
        </>
    );
}

export default Form;

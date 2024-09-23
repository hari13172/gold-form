import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ref, update } from "firebase/database"; // Firebase update method
// @ts-ignore
import { database } from "../firebase"; // Import your Firebase database instance
import "../styles/viewDetails.css";

interface Payment {
    month: string;
    amountPaid: number;
}

interface FormData {
    applicationNumber: string;
    username: string;
    borrowedMoney: number;
    receivedMoney: number;
    pendingMoney: number;
    paymentHistory: Payment[];
}

function ViewDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const data: FormData | null = location.state as FormData;

    const [paymentHistory, setPaymentHistory] = useState<Payment[]>(data?.paymentHistory || []);
    const [isEditing, setIsEditing] = useState<number | null>(null); // Track which payment is being edited
    const [editedAmount, setEditedAmount] = useState<number | null>(null);

    if (!data) {
        return (
            <div className="error-container">
                <h1>Error</h1>
                <p>No details found. Please try again.</p>
                <button className="back-button" onClick={() => navigate(-1)}>
                    Back to List
                </button>
            </div>
        );
    }

    // Function to handle editing a specific payment
    const handleEditClick = (index: number) => {
        setIsEditing(index);
        setEditedAmount(paymentHistory[index].amountPaid);
    };

    // Function to save the edited payment and update the total received money
    const handleSaveClick = (index: number) => {
        if (editedAmount !== null) {
            const updatedPaymentHistory = [...paymentHistory];
            updatedPaymentHistory[index].amountPaid = editedAmount;

            // Recalculate total received money
            const updatedReceivedMoney = updatedPaymentHistory.reduce(
                (total, payment) => total + payment.amountPaid,
                0
            );
            const updatedPendingMoney = data.borrowedMoney - updatedReceivedMoney;

            // Update the Firebase data
            const entryRef = ref(database, `entries/${data.applicationNumber}`);
            update(entryRef, {
                paymentHistory: updatedPaymentHistory,
                receivedMoney: updatedReceivedMoney,
                pendingMoney: updatedPendingMoney,
            });

            // Update state
            setPaymentHistory(updatedPaymentHistory);
            setIsEditing(null);
            setEditedAmount(null);
        }
    };

    return (
        <div className="details-container">
            <h1>Details for {data.username}</h1>
            <p><strong>Application Number:</strong> {data.applicationNumber}</p>
            <p><strong>Borrowed Money:</strong> {data.borrowedMoney}</p>
            <p><strong>Total Received Money:</strong> {paymentHistory.reduce((total, payment) => total + payment.amountPaid, 0)}</p>
            <p><strong>Pending Money:</strong> {data.borrowedMoney - paymentHistory.reduce((total, payment) => total + payment.amountPaid, 0)}</p>
            {data.pendingMoney === 0 && <p style={{ color: "green", fontWeight: "bold" }}>Due Done</p>}

            <h2>Payment History</h2>
            <ul className="payment-history-list">
                {paymentHistory.length > 0 ? (
                    paymentHistory.map((payment, index) => (
                        <li key={index} className="payment-history-item">
                            <div className="payment-info">
                                <strong>{payment.month}:</strong>
                                {isEditing === index ? (
                                    <>
                                        <input
                                            type="number"
                                            value={editedAmount || ""}
                                            onChange={(e) => setEditedAmount(parseFloat(e.target.value))}
                                        />
                                        <button onClick={() => handleSaveClick(index)}>Save</button>
                                    </>
                                ) : (
                                    <>
                                        <span>Paid {payment.amountPaid}</span>
                                        <button onClick={() => handleEditClick(index)}>Edit</button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No payment history available.</p>
                )}
            </ul>

            <button className="back-button" onClick={() => navigate(-1)}>
                Back to List
            </button>
        </div>
    );
}

export default ViewDetails;

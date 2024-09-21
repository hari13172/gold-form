import { useLocation, useNavigate } from "react-router-dom";
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

    // Check if state exists, otherwise provide fallback values
    const data: FormData | null = location.state as FormData;

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

    return (
        <div className="details-container">
            <h1>Details for {data.username}</h1>
            <p><strong>Application Number:</strong> {data.applicationNumber}</p>
            <p><strong>Borrowed Money:</strong> {data.borrowedMoney}</p>
            <p><strong>Total Received Money:</strong> {data.receivedMoney}</p>
            <p><strong>Pending Money:</strong> {data.pendingMoney}</p>
            {data.pendingMoney === 0 && <p style={{ color: "green", fontWeight: "bold" }}>Due Done</p>}

            <h2>Payment History</h2>
            <ul>
                {data.paymentHistory && data.paymentHistory.length > 0 ? (
                    data.paymentHistory.map((payment, index) => (
                        <li key={index}>
                            <strong>{payment.month}:</strong> Paid {payment.amountPaid}
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

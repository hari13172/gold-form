import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { ref, onValue, remove, set } from "firebase/database"; // Import set for saving data
// @ts-ignore
import { database } from "../firebase"; // Import your Firebase database instance
import "../styles/Create.css";
import Header from "./Header";

interface Payment {
    month: string;
    amountPaid: number;
}

interface FormData {
    applicationNumber: string;
    username: string;
    address: string;
    goldGramWeight: string;
    amount: string;
    startDate: string;
    endDate: string;
    phoneNumber: string;
    borrowedMoney?: number;
    receivedMoney?: number;
    pendingMoney?: number;
    paymentHistory?: Payment[];
}

function Create() {
    const [submittedData, setSubmittedData] = useState<{ [key: string]: FormData }>({});
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredData, setFilteredData] = useState<FormData[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<FormData | null>(null);
    const [borrowedMoney, setBorrowedMoney] = useState<number>(0);
    const [receivedMoney, setReceivedMoney] = useState<number>(0);
    const [pendingMoney, setPendingMoney] = useState<number>(0);
    const [currentPayment, setCurrentPayment] = useState<number>(0);
    const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
    const navigate = useNavigate();

    // Load data from Firebase and localStorage on component mount
    useEffect(() => {
        const entriesRef = ref(database, "entries");
        onValue(entriesRef, (snapshot) => {
            const data = snapshot.val() || {};
            setSubmittedData(data);
        });

        // Load from localStorage
        const cachedData = localStorage.getItem('submittedData');
        if (cachedData) {
            setSubmittedData(JSON.parse(cachedData));
        }
    }, []);

    useEffect(() => {
        const filtered = Object.values(submittedData).filter((data) =>
            data.phoneNumber.includes(searchTerm)
        );
        setFilteredData(filtered);
    }, [searchTerm, submittedData]);

    // Calculate pending money whenever borrowed or received money changes
    useEffect(() => {
        setPendingMoney(borrowedMoney - receivedMoney);
    }, [borrowedMoney, receivedMoney]);

    const handleNavigateToForm = () => {
        navigate("/form");
    };

    const handleEdit = (data: FormData) => {
        navigate("/form", { state: { formData: data, isEdit: true } });
    };

    const handleDeleteClick = (data: FormData) => {
        setSelectedEntry(data);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedEntry) {
            const entryRef = ref(database, `entries/${selectedEntry.applicationNumber}`);
            remove(entryRef)
                .then(() => {
                    setIsDeleteModalOpen(false);
                    setSelectedEntry(null);
                })
                .catch((error) => {
                    console.error("Error deleting entry: ", error);
                });
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Open finance modal and set current entry to update finance data
    const handleUsernameClick = (data: FormData) => {
        setSelectedEntry(data);
        setBorrowedMoney(data.borrowedMoney || 0); // Load existing data or reset
        setReceivedMoney(data.receivedMoney || 0); // Load existing data or reset
        setPendingMoney(data.pendingMoney || 0);   // Load existing data or reset
        setPaymentHistory(data.paymentHistory || []); // Load payment history or reset
        setIsFinanceModalOpen(true);
    };

    // Save the finance data into the selected entry and to Firebase & localStorage
    const handleFinanceSubmit = () => {
        if (selectedEntry) {
            // Add the current payment to the payment history
            const newPayment = {
                month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                amountPaid: currentPayment,
            };
            const updatedPaymentHistory = [...paymentHistory, newPayment];
            const updatedReceivedMoney = receivedMoney + currentPayment;
            const updatedPendingMoney = borrowedMoney - updatedReceivedMoney;

            const updatedEntry = {
                ...selectedEntry,
                borrowedMoney,
                receivedMoney: updatedReceivedMoney,
                pendingMoney: updatedPendingMoney,
                paymentHistory: updatedPaymentHistory,
            };

            const newSubmittedData = {
                ...submittedData,
                [selectedEntry.applicationNumber]: updatedEntry,
            };

            // Debugging logs to verify data before saving to Firebase
            console.log("Saving updated entry to Firebase:", updatedEntry);

            // Save to Firebase
            const entryRef = ref(database, `entries/${selectedEntry.applicationNumber}`);
            set(entryRef, updatedEntry)
                .then(() => {
                    console.log("Data saved to Firebase successfully");
                })
                .catch((error) => {
                    console.error("Error saving to Firebase: ", error);
                });

            // Update the state and localStorage
            setSubmittedData(newSubmittedData);
            localStorage.setItem('submittedData', JSON.stringify(newSubmittedData));
        }

        setIsFinanceModalOpen(false);
    };

    // Navigate to View Details page with the selected data
    const handleViewDetails = (data: FormData) => {
        navigate("/viewdetails", { state: { ...data } });
    };

    return (
        <>
            <Header />
            <div className="container">
                <h1>Submitted Data</h1>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by phone number"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <button
                    type="button"
                    className="submit-button"
                    onClick={handleNavigateToForm}
                >
                    <FaPlus className="icon" />
                    Add New Entry
                </button>

                <button
                    type="button"
                    className="due-button"
                    onClick={() => navigate("/duedate")}
                >
                    Due Date
                </button>
            </div>

            <div className="table-container">
                {filteredData.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Application Number</th>
                                <th>Username</th>
                                <th>Address</th>
                                <th>Gold Gram Weight</th>
                                <th>Amount</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Phone Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((data, index) => (
                                <tr key={index}>
                                    <td>{data.applicationNumber}</td>
                                    <td className="clickable" onClick={() => handleUsernameClick(data)}>
                                        {data.username}
                                    </td>
                                    <td>{data.address}</td>
                                    <td>{data.goldGramWeight}</td>
                                    <td>{data.amount}</td>
                                    <td>{data.startDate}</td>
                                    <td>{data.endDate}</td>
                                    <td>{data.phoneNumber}</td>
                                    <td>
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEdit(data)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteClick(data)}
                                        >
                                            <FaTrash />
                                        </button>
                                        <button
                                            className="view-details-button"
                                            onClick={() => handleViewDetails(data)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No data found.</p>
                )}
            </div>

            {isDeleteModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Are you sure you want to delete?</h3>
                        <p>Entry with Application Number: {selectedEntry?.applicationNumber}</p>
                        <div className="modal-actions">
                            <button onClick={handleDeleteConfirm} className="confirm-button">Yes</button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="cancel-button">No</button>
                        </div>
                    </div>
                </div>
            )}

            {isFinanceModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Finance Details for {selectedEntry?.username}</h3>
                        <form onSubmit={handleFinanceSubmit}>
                            <div className="form-group">
                                <label>Borrowed Money:</label>
                                <input
                                    type="number"
                                    value={borrowedMoney}
                                    onChange={(e) => setBorrowedMoney(parseFloat(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Received Money:</label>
                                <input
                                    type="number"
                                    value={receivedMoney}
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>Pending Money:</label>
                                <input type="number" value={pendingMoney} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Current Payment:</label>
                                <input
                                    type="number"
                                    value={currentPayment}
                                    onChange={(e) => setCurrentPayment(parseFloat(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="confirm-button">Submit</button>
                                <button type="button" onClick={() => setIsFinanceModalOpen(false)} className="cancel-button">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Create;

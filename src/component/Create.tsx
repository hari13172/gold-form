import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { ref, onValue, remove, set } from "firebase/database"; // Import set for saving data
// @ts-ignore
import { database } from "../firebase"; // Import your Firebase database instance
import "../styles/Create.css";
import Header from "./Header";
import Papa from "papaparse"; // For CSV conversion

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
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<FormData | null>(null);
    const [borrowedMoney, setBorrowedMoney] = useState<number>(0);
    const [receivedMoney, setReceivedMoney] = useState<number>(0);
    const [pendingMoney, setPendingMoney] = useState<number>(0);
    const [currentPayment, setCurrentPayment] = useState<number>(0);
    const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
    const [loadingCSV, setLoadingCSV] = useState(false); // To handle download button state
    const navigate = useNavigate();

    // Load data from Firebase on component mount
    useEffect(() => {
        const entriesRef = ref(database, "entries");
        onValue(entriesRef, (snapshot) => {
            const data = snapshot.val() || {};
            setSubmittedData(data); // Set state with fresh data from Firebase
            setIsLoading(false);    // Stop loading animation when data is fetched
        });
    }, []);

    useEffect(() => {
        const filtered = Object.values(submittedData)
            .filter((data) => data.phoneNumber.includes(searchTerm))
            .reverse();  // Reverse the array to show the most recent entries first
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

    // Save the finance data into the selected entry and update Firebase & local state immediately
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

            // Save to Firebase
            const entryRef = ref(database, `entries/${selectedEntry.applicationNumber}`);
            set(entryRef, updatedEntry)
                .then(() => {
                    console.log("Data saved to Firebase successfully");
                    // Update the state with the new entry data immediately
                    setSubmittedData(newSubmittedData);
                    setCurrentPayment(0); // Reset current payment field
                })
                .catch((error) => {
                    console.error("Error saving to Firebase: ", error);
                });
        }

        setIsFinanceModalOpen(false);
    };

    const handleDownloadCSV = () => {
        setLoadingCSV(true);

        // Define the order of the fields you want in the CSV
        const dataToExport = Object.values(submittedData).map((entry) => ({
            "Application Number": entry.applicationNumber,
            "Username": entry.username,
            "Address": entry.address,
            "Gold Gram Weight": entry.goldGramWeight,
            "Amount": entry.amount,
            "Start Date": entry.startDate,
            "End Date": entry.endDate,
            "Phone Number": entry.phoneNumber,
        }));

        // If no data available, show an alert
        if (dataToExport.length === 0) {
            alert("No data available for export.");
            setLoadingCSV(false);
            return;
        }

        // Convert data to CSV format using PapaParse
        const csv = Papa.unparse(dataToExport);

        // Create a blob from the CSV data
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // Create an anchor element and click it to download the file
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "submitted_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setLoadingCSV(false);
    };

    // Navigate to View Details page with the selected data
    const handleViewDetails = (data: FormData) => {
        navigate("/viewdetails", { state: { ...data } });
    };

    // If the data is still loading, show the loading spinner
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

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

                <div className="gap">
                    <button
                        type="button"
                        className="due-button"
                        onClick={() => navigate("/duedate")}
                    >
                        Due Date
                    </button>

                    <button
                        type="button"
                        className="download-button"
                        onClick={handleDownloadCSV}
                        disabled={loadingCSV}
                    >
                        {loadingCSV ? "Downloading..." : "Download CSV"}
                    </button>
                </div>
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

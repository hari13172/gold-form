import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { ref, onValue, remove } from "firebase/database";
// @ts-ignore
import { database } from "../firebase";
import "../styles/Create.css";

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

function Create() {
    const [submittedData, setSubmittedData] = useState<{ [key: string]: FormData }>({}); // Store submitted data
    const [searchTerm, setSearchTerm] = useState<string>(""); // Store search term for phone number
    const [filteredData, setFilteredData] = useState<FormData[]>([]); // Store filtered data based on search
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Manage delete modal visibility
    const [selectedEntry, setSelectedEntry] = useState<FormData | null>(null); // Store the entry to be deleted
    const navigate = useNavigate();

    // Clear localStorage when the component mounts
    useEffect(() => {
        localStorage.clear(); // Clear localStorage to remove old data
    }, []);

    // Load data from Firebase on component mount
    useEffect(() => {
        const entriesRef = ref(database, "entries");
        onValue(entriesRef, (snapshot) => {
            const data = snapshot.val() || {};
            setSubmittedData(data); // Load previously submitted data into state
        });
    }, []);

    // Update filtered data when search term or submitted data changes
    useEffect(() => {
        const filtered = Object.values(submittedData).filter((data) =>
            data.phoneNumber.includes(searchTerm)
        );
        setFilteredData(filtered);
    }, [searchTerm, submittedData]);

    const handleNavigateToForm = () => {
        navigate("/form"); // Navigate to the form page
    };

    // Navigate to the form page with pre-filled data for editing
    const handleEdit = (data: FormData) => {
        navigate("/form", { state: { formData: data, isEdit: true } });
    };

    // Show the confirmation modal for deleting an entry
    const handleDeleteClick = (data: FormData) => {
        setSelectedEntry(data);
        setIsDeleteModalOpen(true); // Show the delete confirmation modal
    };

    // Confirm and delete the entry
    const handleDeleteConfirm = () => {
        if (selectedEntry) {
            const entryRef = ref(database, `entries/${selectedEntry.applicationNumber}`);
            remove(entryRef)
                .then(() => {
                    alert(`Entry with Application Number ${selectedEntry.applicationNumber} deleted successfully.`);
                    setIsDeleteModalOpen(false); // Close the modal after deletion
                    setSelectedEntry(null); // Clear the selected entry
                })
                .catch((error) => {
                    console.error("Error deleting entry: ", error);
                });
        }
    };

    // Handle search input change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (
        <>
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
            </div>

            {/* Separated Table Section */}
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
                                <th>Actions</th> {/* New column for actions */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((data, index) => (
                                <tr key={index}>
                                    <td>{data.applicationNumber}</td>
                                    <td>{data.username}</td>
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No data found.</p>
                )}
            </div>

            {/* Delete confirmation modal */}
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
        </>
    );
}

export default Create;

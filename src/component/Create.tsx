import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { ref, onValue, remove } from "firebase/database"; // Firebase methods for data handling
import { database } from "../firebase"; // Import Firebase database

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
    const navigate = useNavigate();

    // Clear localStorage when the component mounts
    useEffect(() => {
        localStorage.clear();  // Clear localStorage to remove old data
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

    // Handle delete operation
    const handleDelete = (applicationNumber: string) => {
        const entryRef = ref(database, `entries/${applicationNumber}`);
        remove(entryRef)
            .then(() => {
                alert(`Entry with Application Number ${applicationNumber} deleted successfully.`);
            })
            .catch((error) => {
                console.error("Error deleting entry: ", error);
            });
    };

    // Handle search input change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (
        <>
            {/* Search and Button Form */}
            <div className="container">
                <h1>Submitted Data</h1>

                {/* Search Bar for Phone Number */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by phone number"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-bar"
                    />
                </div>

                {/* New Entry Button */}
                <button
                    type="button"
                    className="submit-button"
                    onClick={handleNavigateToForm}
                >
                    <FaPlus className="icon" /> {/* Plus icon */}
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
                                            onClick={() => handleDelete(data.applicationNumber)}
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
        </>
    );
}

export default Create;

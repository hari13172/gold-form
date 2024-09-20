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
    const [submittedData, setSubmittedData] = useState<{ [key: string]: FormData }>({});
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredData, setFilteredData] = useState<FormData[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<FormData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const entriesRef = ref(database, "entries");
        onValue(entriesRef, (snapshot) => {
            const data = snapshot.val() || {};
            setSubmittedData(data);
        });
    }, []);

    useEffect(() => {
        const filtered = Object.values(submittedData).filter((data) =>
            data.phoneNumber.includes(searchTerm)
        );
        setFilteredData(filtered);
    }, [searchTerm, submittedData]);

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
                    alert(`Entry with Application Number ${selectedEntry.applicationNumber} deleted successfully.`);
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

    // Navigate to Due Date page
    const handleNavigateToDueDate = () => {
        navigate("/duedate");
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

                <button
                    type="button"
                    className="due-button"
                    onClick={handleNavigateToDueDate}
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

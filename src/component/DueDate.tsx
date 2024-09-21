import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

// @ts-ignore
import { database } from "../firebase";
import "../styles/due.css";

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

function DueDate() {
    const [dueEntries, setDueEntries] = useState<FormData[]>([]);
    const navigate = useNavigate();



    const handleNavigateToCreate = () => {
        navigate("/create");
    };

    useEffect(() => {
        const entriesRef = ref(database, "entries");

        // Fetch the data from Firebase
        onValue(entriesRef, (snapshot) => {
            const data = snapshot.val() || {};

            // Cast data to FormData[] before filtering
            const entriesArray = Object.values(data) as FormData[];

            // Filter entries based on some condition, e.g., if the end date has passed
            const filteredData = entriesArray.filter((entry: FormData) => {
                const today = new Date();
                const endDate = new Date(entry.endDate);
                return endDate < today; // Example: show due entries where endDate has passed
            });


            setDueEntries(filteredData);
        });
    }, []);

    return (
        <div className="due-container">
            <button onClick={handleNavigateToCreate}>Go back to Create page</button>

            <h1 className="due-title">Due Date Entries</h1>

            <div className="table-container">
                {dueEntries.length > 0 ? (
                    <table className="due-table">
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
                            </tr>
                        </thead>
                        <tbody>
                            {dueEntries.map((data, index) => (
                                <tr key={index}>
                                    <td>{data.applicationNumber}</td>
                                    <td>{data.username}</td>
                                    <td>{data.address}</td>
                                    <td>{data.goldGramWeight}</td>
                                    <td>{data.amount}</td>
                                    <td>{data.startDate}</td>
                                    <td>{data.endDate}</td>
                                    <td>{data.phoneNumber}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-due-data">No entries have reached the due date.</p>
                )}
            </div>

        </div>
    );
}

export default DueDate;

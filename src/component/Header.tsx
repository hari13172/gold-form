import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/logo.png"

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="logo">
                <img src={logo} alt="App Logo" />
                <div className="lname">
                    <h2>Bling</h2>
                </div>
            </div>

            <div className="cont">
                <h1>Gold Shop</h1>
            </div>
            <nav className="nav-menu">
                <ul>
                    <li>
                        <Link to="/create">Create</Link>
                    </li>
                    <li>
                        <Link to="/form">Add New</Link>
                    </li>
                    <li>
                        <Link to="/duedate">Due Date</Link>
                    </li>

                    {/* <li>
                        <Link to="/viewDetails">View Details</Link>
                    </li> */}
                </ul>
            </nav>
        </header>
    );
};

export default Header;

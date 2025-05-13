import React from "react";

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="container mt-4">
            <h2>Welcome, {user.name || "User"}!</h2>
            <p className="text-muted">Role: {user.role}</p>
            {/* Extend with dashboard widgets */}
        </div>
    );
};

export default Dashboard;
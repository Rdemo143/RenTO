import React, { useState } from "react";

const LeaseAgreement = () => {
    const [lease, setLease] = useState({
        tenantName: "",
        startDate: "",
        endDate: "",
        rent: "",
        terms: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Lease agreement submitted.");
    };

    return (
        <div className="container mt-4">
            <h3>Create Lease Agreement</h3>
            <form onSubmit={handleSubmit}>
                <input className="form-control mb-2" type="text" placeholder="Tenant Name" required />
                <input className="form-control mb-2" type="date" placeholder="Start Date" required />
                <input className="form-control mb-2" type="date" placeholder="End Date" required />
                <input className="form-control mb-2" type="number" placeholder="Rent Amount" required />
                <textarea className="form-control mb-3" placeholder="Terms & Conditions" rows={5}></textarea>
                <button className="btn btn-primary">Submit Lease</button>
            </form>
        </div>
    );
};

export default LeaseAgreement;
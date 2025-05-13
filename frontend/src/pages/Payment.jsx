import React, { useState } from "react";
import { processPayment } from "../api/payment";

const Payment = () => {
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState(null);

    const handlePayment = async () => {
        const token = localStorage.getItem("token");
        try {
            const data = await processPayment({ amount, tenantId: "sample-id", paymentMethod: "card" }, token);
            setStatus(Success:${data.transactionId });
        } catch {
            setStatus("Payment failed.");
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: 400 }}>
            <h3>Rent Payment</h3>
            <input
                className="form-control mb-3"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button className="btn btn-success w-100" onClick={handlePayment}>
                Pay Now
            </button>
            {status && <div className="mt-3 alert alert-info">{status}</div>}
        </div>
    );
};

export default Payment;
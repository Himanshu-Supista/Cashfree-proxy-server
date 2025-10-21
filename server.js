import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const CASHFREE_BASE_URL = "https://api.cashfree.com/verification";

// Endpoint 1: PAN → GSTIN
app.post("/verify-pan-gstin", async (req, res) => {
    try {
        const { pan, verification_id } = req.body;
        if (!pan) return res.status(400).json({ error: "PAN is required" });

        const uniqueVerificationId =
            verification_id || `verify_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const response = await fetch(`${CASHFREE_BASE_URL}/pan-gstin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": process.env.CASHFREE_CLIENT_ID,
                "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
            },
            body: JSON.stringify({
                pan,
                verification_id: uniqueVerificationId,
            }),
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint 2: Penny Drop Verification
app.post("/penny-drop", async (req, res) => {
    try {
        const { name, bank_account, ifsc } = req.body;
        if (!name || !bank_account || !ifsc)
            return res.status(400).json({ error: "name, bankAccount, and ifsc are required" });

        const response = await fetch(`${CASHFREE_BASE_URL}/bank-account/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": process.env.CASHFREE_CLIENT_ID,
                "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
            },
            body: JSON.stringify({
                name,
                bank_account,
                ifsc,
            }),
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

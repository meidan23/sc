import React, { useState } from "react";
import { Button } from "@nextui-org/react";

const Reset = () => {
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleReset = async () => {
        setMessage(null);
        setError(null);

        try {
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error("Failed to reset slots and teams");
            }

            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button className="text-white bg-blue-500 rounded p-2" onPress={handleReset} auto>
                איפוס כל הסלוטים והקבוצות
            </Button>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Reset;

import React, { useState } from 'react';
// Reuse styles from AddExpenseModal
import '../AddExpenseModal/AddExpenseModal.css';

const DateFilterModal = ({ initialStartDate, initialEndDate, onClose, onApplyFilter }) => {
    // Initialize state with passed dates or empty strings
    const [startDate, setStartDate] = useState(initialStartDate || '');
    const [endDate, setEndDate] = useState(initialEndDate || '');

    const handleApply = () => {
        // Basic validation: Allow empty dates (to clear filter) but ensure end >= start if both set
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert("End date cannot be earlier than start date.");
            return;
        }
        onApplyFilter(startDate, endDate); // Pass dates back
        onClose();
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        onApplyFilter('', ''); // Pass empty strings to clear filter
        onClose();
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>Filter Expenses by Date</h2>

                <form onSubmit={(e) => { e.preventDefault(); handleApply(); }} className="expense-form"> {/* Reuse form class */}
                    <div className="form-group-row"> {/* Reuse row class */}
                        <div className="form-group"> {/* Reuse group class */}
                            <label htmlFor="startDate">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                         <div className="form-group"> {/* Reuse group class */}
                            <label htmlFor="endDate">End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="modal-actions"> {/* Container for buttons */}
                       <button type="button" className="modal-btn clear-btn" onClick={handleClear}>
                         Clear Filter
                       </button>
                       <button type="submit" className="modal-btn apply-btn">
                         Apply Filter
                       </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DateFilterModal;
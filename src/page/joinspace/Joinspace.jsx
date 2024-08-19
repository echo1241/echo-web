// src/component/modal/UrlInputPopup.jsx
import React, { useState } from 'react';
import Popup from '../../component/modal/Popup';

function Joinspace({ closePopup, onSubmit, spaceUUID }) {
    const [url, setUrl] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (url.trim()) {
            onSubmit(url);
            closePopup();
            setUrl('');
        }
    };

    return (
        <Popup closePopup={closePopup}>
            <h2>Enter Space UUID</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="url">Space UUID:<br/>{spaceUUID}</label>
                    <input
                        type="text"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </Popup>
    );
}

export default Joinspace;

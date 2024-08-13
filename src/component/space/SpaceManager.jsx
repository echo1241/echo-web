// SpaceManager.jsx
import React, { useState, useEffect } from 'react';
import Popup from '../modal/Popup';
import './SpaceManager.css';
import { useAxios } from '../../hook/useAxios';

const SpaceManager = ({ onAddClick, onDmClick }) => {
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [name, setName] = useState('');
    const [publicStatus, setPublicStatus] = useState('Y');

    const { authenticationConnect } = useAxios();

    const fetchSpaces = async () => {
        try {
            const response = await authenticationConnect('get', "/spaces/public");
            setSpaces(response.data);
        } catch (error) {
            console.error('Error fetching spaces:', error);
            setError('Failed to load spaces');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await authenticationConnect("post", "/spaces", {
                spaceName: name,
                isPublic: publicStatus,
                thumbnail: null
            });
            fetchSpaces();
            setPopupVisible(false);
            setName('');
            setPublicStatus('Y');
        } catch (error) {
            console.error('Error creating space:', error);
            setError('Failed to create space');
        }
    };

    const handleSpaceClick = (id) => {
        console.log('Selected Space ID:', id);
        onAddClick(id);
    };

    return (
        <>
            <div className="add-wrap">
                <div className="DM add" onClick={onDmClick}>DM</div>
                {!loading && !error && spaces.map((space) => (
                    <div
                        key={space.id}
                        className="cir-btn"
                        onClick={() => handleSpaceClick(space.id)}
                    >
                        <p>{space.spaceName}</p>
                    </div>
                ))}
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                <div className="add" onClick={() => setPopupVisible(true)}>Add</div>
            </div>

            {popupVisible && (
                <Popup closePopup={() => setPopupVisible(false)}>
                    <h2>Enter Details</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="public">Public:</label>
                            <select
                                id="public"
                                value={publicStatus}
                                onChange={(e) => setPublicStatus(e.target.value)}
                                required
                            >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
                        </div>
                        <button type="submit">Submit</button>
                    </form>
                </Popup>
            )}
        </>
    );
};

export default SpaceManager;

// src/component/space/SpaceManager.jsx
import React, { useState, useEffect } from 'react';
import Popup from '../modal/Popup';
import Joinspace from '../../page/joinspace/Joinspace'; // 올바른 경로로 수정
import './SpaceManager.css';
import { useAxios } from '../../hook/useAxios';


const SpaceManager = ({ onAddClick, onDmClick }) => {
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [joinspaceVisible, setJoinspaceVisible] = useState(false); // Joinspace 팝업 상태 추가
    const [name, setName] = useState('');
    const [publicStatus, setPublicStatus] = useState('Y');
    const [selectedSpaceUUID, setSelectedSpaceUUID] = useState('');
    const [selectedSpaceId, setSelectedSpaceSpaceId] = useState(null)

    const { authenticationConnect } = useAxios();

    const fetchSpaces = async () => {
        try {
            const response = await authenticationConnect('get', "/spaces/my");
            setSpaces(response.data);
        } catch (error) {
            console.error('Error fetching spaces:', error);

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

    const handleSpaceClick = (id, uuid) => {
        onAddClick(id);
        setSelectedSpaceUUID(uuid)
        setSelectedSpaceSpaceId(id)

    };

    const handleUrlSubmit = async (uuid) => {
        try {
            await authenticationConnect('post', `/spaces/join/${uuid}`);
            fetchSpaces();
        } catch (error) {
            console.error('Error joining space:', error);
            setError('Failed to join space');
        }
    };

    return (
        <>
            <div className="add-wrap">
                <div className="DM add" onClick={onDmClick}>DM</div>
                {!loading && !error && spaces.map((space) => (
                    <div
                        key={space.id}
                        className="cir-btn add"
                        onClick={() => handleSpaceClick(space.id, space.uuid)}
                        style={{backgroundColor: selectedSpaceId === space.id ? 'lightblue' :  'green'}} //입장한 스페이스 색깔 변경
                    >
                        <p className={space.id}>{space.spaceName}</p>
                    </div>
                ))}
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                <div className="add" onClick={() => setPopupVisible(true)}>Add</div>
                <div className="add join" onClick={() => setJoinspaceVisible(true)}>Join</div>
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

            {joinspaceVisible && (
                <Joinspace
                    closePopup={() => setJoinspaceVisible(false)}
                    onSubmit={handleUrlSubmit}
                    spaceUUID={selectedSpaceUUID}
                />
            )}
        </>
    );
};

export default SpaceManager;

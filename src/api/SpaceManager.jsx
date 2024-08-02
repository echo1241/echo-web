import React, { useState, useEffect } from 'react';
import { authenticationInstance } from './axios';  // axios 인스턴스 임포트
import Popup from '../component/modal/Popup';  // Popup 컴포넌트 임포트
import './SpaceManager.css';  // CSS 파일 임포트

const SpaceManager = ({ onAddClick }) => {
    const [spaces, setSpaces] = useState([]);  // 공간 목록 상태
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState('');  // 오류 상태
    const [popupVisible, setPopupVisible] = useState(false);  // 팝업 가시성 상태
    const [name, setName] = useState('');  // 공간 이름 상태
    const [publicStatus, setPublicStatus] = useState('Y');  // 공개 여부 상태

    const fetchSpaces = async () => {
        try {
            const response = await authenticationInstance().get("/spaces/public");
            setSpaces(response.data);  // 상태 업데이트
        } catch (error) {
            console.error('Error fetching spaces:', error);
            setError('Failed to load spaces');
        } finally {
            setLoading(false);  // 로딩 상태 업데이트
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await authenticationInstance().post("/spaces", {
                spaceName: name,
                isPublic: publicStatus,
                thumbnail: null
            });
            fetchSpaces();  // 공간 목록을 새로 고침
            setPopupVisible(false);
            setName('');
            setPublicStatus('Y');
        } catch (error) {
            console.error('Error creating space:', error);
            setError('Failed to create space');
        }
    };

    const handleSpaceClick = (id) => {
        console.log('Selected Space ID:', id);  // 클릭된 스페이스 ID 콘솔 출력
        onAddClick(id); // 부모 컴포넌트로 ID 전달
    };

    return (
        <>
            <div className="add-wrap">
                {/* 공간 목록 */}
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

            {/* 팝업창 */}
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

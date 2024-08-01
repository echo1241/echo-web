// src/component/SpaceManager.jsx
import React, { useState, useEffect } from 'react';
import { authenticationInstance } from '../api/axios';  // axios 인스턴스 임포트

const SpaceManager = ({ onAddClick }) => {
    const [spaces, setSpaces] = useState([]);  // 공간 목록 상태
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState('');  // 오류 상태

    // 컴포넌트가 마운트될 때 공간 목록을 가져온다.
    useEffect(() => {
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

        fetchSpaces();
    }, []);  // 빈 의존성 배열로 컴포넌트가 마운트될 때만 호출됨

    return (
        <div className="add-wrap">
            {/* 공간 목록 */}
            {!loading && !error && spaces.map((space) => (
                <div key={space.id} className="cir-btn">
                    <p>{space.spaceName}</p>
                </div>
            ))}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className="add" onClick={onAddClick}>Add</div>
        </div>
    );
};

export default SpaceManager;

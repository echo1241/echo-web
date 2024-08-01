import React, { useState } from 'react';
import './mainPage.css';
import Popup from "../../component/modal/Popup";
import axios from 'axios';
import {authenticationInstance} from "../../api/axios";  // axios를 임포트

function MainPage() {
    const [popupVisible, setPopupVisible] = useState(false);
    const [name, setName] = useState('');
    const [publicStatus, setPublicStatus] = useState('Y');

    const handleAddClick = () => {
        setPopupVisible(true);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // API 호출
            const response = await authenticationInstance().post("/spaces", {
                spaceName: name,
                isPublic: publicStatus,
                thumbnail: null
            });

            // 성공적인 응답 처리
            console.log('Space created:', response.data);
            // 팝업 닫기
            setPopupVisible(false);
            // 입력 필드 초기화
            setName('');
            setPublicStatus('Y');
        } catch (error) {
            console.error('Error creating space:', error);
            // 오류 처리
        }
    };

    return (
        <>
            <div className="social cell">
                <div className="add-wrap">
                <div className="add" onClick={handleAddClick}>Add</div>
                </div>
            </div>
            <div className="main cell">
                <div className="sub">
                    <div className="voice cell">
                        <hr className="line"/>
                        <div className="icon-box">
                            <div className="profile cell"></div>
                            <div className="mic cell"></div>
                            <div className="sound cell"></div>
                            <div className="setting cell"></div>
                        </div>
                    </div>

                    <div className="chat cell">
                        <div className="top-box cell">
                            <div className="chat-names cell">
                                <a className="chat-name">#</a>
                            </div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <input type="search" className="top-icon"/>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                            <div className="thread top-icon cell"></div>
                        </div>
                        <hr className="line"/>
                        <div className="send-chat">
                            <div className="plus icon cell"></div>
                            <div className="img icon cell"></div>
                            <div className="send icon cell"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 팝업창 */}
            {popupVisible && <Popup closePopup={() => setPopupVisible(false)}>
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
            </Popup>}
        </>
    );
}

export default MainPage;

import React from 'react';
import './MaintenancePage.css';

function MaintenancePage() {
    return (
        <div className="maintenance-container">
            <div className="maintenance-spinner"></div>
            <h1 className="maintenance-header">서비스 점검 중</h1>
            <p className="maintenance-contents">현재 서비스 점검 중입니다. 잠시 후에 다시 시도해 주세요.</p>
            <p>불편을 드려서 죄송합니다.</p>
        </div>
    );
}

export default MaintenancePage;
import ModalPortal from "./Portal";
import "./modal.css";
import React, { useState } from "react";

function Popup({children, closePopup}) {

    const handlePopupClick = (e) => {
        if (e.target.id === "content" || e.target.closest("#content")) {
            // content 내부 요소를 클릭한 경우 이벤트 전파를 멈춘다.
            e.stopPropagation();
            return;
        }
        closePopup(false);
        // content 외부 요소를 클릭한 경우에만 실행되는 코드 작성 가능
        console.log("close popup");
    }

    return (
        <ModalPortal id="modal">
            <div className="alert-wrap" onClick={handlePopupClick}>
                <div className="popup-content">
                    <span className="close" onClick={handlePopupClick}>&times;</span>
                    <div id="content">
                        {children}
                    </div>
                </div>
                </div>
        </ModalPortal>
);
}

export default Popup;
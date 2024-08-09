import React, { useEffect } from "react";
import { useAxios } from "../../hook/useAxios";

function Oauth() {
    const { connect } = useAxios();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const codeParam = query.get('code');

        if (codeParam) {
            // 'code' 파라미터가 존재할 때 API 요청을 보냅니다.
            const fetchKakaoLogin = async () => {
                try {
                    const response = await connect('get', `/user/kakao/callback?code=${codeParam}`);
                    // 성공적으로 응답을 받았을 때 처리
                    console.log('Kakao login response:', response.data);
                    // 토큰 저장 및 리다이렉트
                    const { accessToken, refreshToken } = response.data;
                    sessionStorage.setItem("accessToken", accessToken);
                    sessionStorage.setItem("refreshToken", refreshToken);

                    // 필요한 경우 메인 페이지나 다른 페이지로 리다이렉트
                    window.location.href = '/main';
                } catch (error) {
                    // 에러 처리
                    console.error('Kakao login error:', error);
                }
            };
            fetchKakaoLogin();
        }
    }, [connect]);

    return <></>;
}

export default Oauth;

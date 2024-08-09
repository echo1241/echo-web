import { useNavigate } from 'react-router-dom';
import axios from 'axios';


async function sendAxiosRequest(method, uri, data, headers, navigate) {
    const protocol = process.env.REACT_APP_ISSECURE === 'true'? 'https://' : 'http://';

    try{
        return await axios({
            method: method,
            url: protocol + process.env.REACT_APP_SERVER + uri,
            data: data,
            headers: headers
        });
    } catch(e) {
        console.error(e)
        // 만약 401 에러라면, accessToken과 refreshToken을 날려버린다.
        if (e?.response?.status === 401) {
            console.log("토큰이 만료되었습니다.");
            sessionStorage.clear();
            navigate('/login');
        }        
        throw e;
    }
}

// 커스텀 훅 정의
export function useAxios() {
    const navigate = useNavigate();

    const connect = async (method, uri, data) => {
        const headers = {
            'Content-Type': 'application/json',
        };

        const response = await sendAxiosRequest(method, uri, data, headers, navigate);
        return response;
    };

    const authenticationConnect = async (method, uri, data) => {
        const token = sessionStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };

        const response = await sendAxiosRequest(method, uri, data, headers, navigate);
        return response;
    };

    return { connect, authenticationConnect };
}
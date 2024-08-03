import axios from 'axios';

// axiosUtil 작성
// try - catch 처리를 위함

export async function connect(method, uri, data) {
    const headers = {
        contentType: 'application/json',
    }

    return await sendAxiosRequest(method, uri, data, headers);
}

export async function authenticationConnect(method, uri, data) {
    const token = sessionStorage.getItem('accessToken');

    const headers = {
        contentType: 'application/json',
        Authorization: `Bearer ${token}`
    }

    return await sendAxiosRequest(method, uri, data, headers);
}

async function sendAxiosRequest(method, uri, data, headers) {
    try{
        return await axios({
            method: method,
            url: process.env.REACT_APP_URL + uri,
            data: data,
            headers: headers
        });
    } catch(e) {
        console.error(e)
        // 만약 401 에러라면, accessToken과 refreshToken을 날려버린다.
        if (e?.response?.status === 401) {
            console.log("토큰이 만료되었습니다.");
            sessionStorage.clear();
        }
        // 에러 관련 메시지 리턴해준다.

        // 에러 메시지는 data안에 있음 ex) res.data.msg
        return e.response;
    }
}
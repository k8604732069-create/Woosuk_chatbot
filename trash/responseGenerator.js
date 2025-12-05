const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'academics.json');
let chatbotData = { keywords: [], default_response: "데이터 로드 실패." };

try {
    // JSON 파일을 동기적으로 읽고, JSON.parse를 사용하여 JavaScript 객체로 변환
    const rawData = fs.readFileSync(dataPath, 'utf8');
    chatbotData = JSON.parse(rawData);
    console.log("✅ 챗봇 응답 데이터 로드 성공.");
} catch (err) {
    console.error(`챗봇 데이터 파일을 읽는 중 오류 발생: ${err.message}`);
}

function getBotResponse(message) {
    const msg = message.toLowerCase().trim();

    // JSON 데이터 순회 및 키워드 찾기
    for (const item of chatbotData.keywords) {
        const keyword = item.keyword ? String(item.keyword).toLowerCase() : '';
        const aliases = Array.isArray(item.aliases) ? item.aliases : [];

        const foundInKeyword = keyword !== '' && msg.includes(keyword);
        const foundInAliases = aliases.some(alias => {
            return typeof alias === 'string' && alias !== '' && msg.includes(alias.toLowerCase());
        });

        if (foundInKeyword || foundInAliases) {
            return item.response; // 일치하는 응답 반환
        }
    }

    // 기본 인사 응답 처리
    if (msg.includes("안녕") || msg.includes("안녕하세요")) {
        return "안녕하세요! 저는 우석대 도우미 우디봇입니다. 무엇을 도와드릴까요?";
    }

    // 기본 응답 처리
    return chatbotData.default_response.replace('{message}', message);
}

module.exports = {
    getBotResponse
};
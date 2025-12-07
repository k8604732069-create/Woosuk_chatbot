// const { createClient } = require('@supabase/supabase-js');

// Supabase 불러오기
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("FATAL: Supabase 환경 변수가 설정되지 않았습니다.");
}

//  클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'chatbot_responses'; // 사용할 테이블 이름

// 챗봇 응답 생성 함수
async function getBotResponse(message) {
    const msg = message.toLowerCase().trim();

    try {
        // 데이터베이스에서 응답 규칙 불러오기
        let { data: rules, error } = await supabase
            .from(TABLE_NAME)
            .select('keyword, aliases, response');

        if (error) {
            console.error("Supabase 쿼리 오류 상세:", error);
            throw error; // 오류가 있다면 여기서 서버에 명확히 전달
        }
        
        console.log(`✅ Supabase 조회 성공: 총 ${rules ? rules.length : 0}개 레코드 발견.`);
        // rules 배열 내용의 처음 1~2개 항목을 출력하여 데이터 타입 확인
        if (rules && rules.length > 0) {
            console.log("첫 번째 레코드 내용:", rules[0]);
        }

        if (!rules) {
            return "데이터베이스에서 규칙을 가져오지 못했습니다.";
        }

        if (rules.length === 0) {
            return "현재 챗봇 응답 데이터베이스에 규칙이 없습니다.";
        }

        // 키워드 매칭 로직 (클라이언트 측에서 수행)
        for (const item of rules) {
            const keyword = item.keyword ? item.keyword.toLowerCase() : '';
            
            let aliases = [];
            if (item.aliases && typeof item.aliases === 'string') {
                 try {
                     aliases = JSON.parse(item.aliases); 
                 } catch (e) {
                     console.error(`JSON 파싱 오류 발생 (Keyword: ${item.keyword}):`, e);
                     continue; // 이 항목 건너뛰기
                 }
            } else if (Array.isArray(item.aliases)) {
                aliases = item.aliases;
            }
            // 키워드 또는 별칭 중 하나라도 메시지에 포함되어 있는지 확인
            const matchFound = 
            msg.includes(keyword) || 
            (Array.isArray(aliases) && aliases.some(alias => 
                typeof alias === 'string' && msg.includes(alias.toLowerCase())
            ));

            if (matchFound) {
                return item.response; // 일치하는 응답 반환
            }
        }
        
        
        // 기본 응답
        if (msg.includes("안녕") || msg.includes("안녕하세요")) {
            return "안녕하세요! 우석대 도우미 우디봇입니다. 무엇을 도와드릴까요?";
        }

        return `죄송합니다. 요청하신 "${message}"에 대한 정보를 찾을 수 없습니다. 도움이 필요하시면 다른 질문을 해주세요.`;

    } catch (error) {
        console.error('Supabase 데이터 조회 중 오류 발생:', error.message);
        return "죄송합니다. 서버가 데이터베이스와 통신하는 데 실패했습니다.";
    }
}

module.exports = {
    getBotResponse
};
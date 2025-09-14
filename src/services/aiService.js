const OpenAI = require('openai');

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async processJLPTReading(passage) {
        try {
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
                console.log('Using fallback - OpenAI API not available');
                return this.fallbackProcessJLPTReading(passage);
            }

            const prompt = `
Bạn là một chuyên gia về JLPT (Japanese Language Proficiency Test). Nhiệm vụ của bạn là phân tích bài đọc JLPT và tạo ra nội dung học tập.

ĐẦU VÀO: Bài đọc JLPT sau:
"${passage}"

YÊU CẦU:
1. Tạo 3-5 câu hỏi trắc nghiệm dựa trên bài đọc, mỗi câu có 4 đáp án (1 đúng, 3 sai gây nhiễu).
2. Trích xuất ngữ pháp quan trọng theo từng level JLPT (N5, N4, N3, N2, N1).
3. Trích xuất từ vựng hay và quan trọng xuất hiện trong bài đọc, phân loại theo level JLPT.

ĐỊNH DẠNG RESPONSE (chỉ trả về JSON, không có text khác):
{
  "questions": [
    {
      "question": "Câu hỏi bằng tiếng Nhật hoặc tiếng Việt",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctIndex": 0,
      "explanation": "Giải thích đáp án đúng"
    }
  ],
  "grammar": {
    "N5": ["ngữ pháp 1", "ngữ pháp 2"],
    "N4": ["ngữ pháp 3"],
    "N3": [],
    "N2": [],
    "N1": []
  },
  "vocabulary": {
    "N5": [{"word": "từ vựng", "meaning": "nghĩa", "reading": "hán tự"}],
    "N4": [],
    "N3": [],
    "N2": [],
    "N1": []
  }
}

Lưu ý:
- Câu hỏi phải dựa trên nội dung bài đọc.
- Đáp án sai phải hợp lý và gây nhiễu.
- Ngữ pháp và từ vựng phải chính xác theo level JLPT.
- Nếu không có ngữ pháp/từ vựng cho level nào, để mảng rỗng.
`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
                temperature: 0.7,
            });

            const content = response.choices[0].message.content.trim();
            const result = JSON.parse(content);

            return result;

        } catch (error) {
            console.error('Error processing JLPT reading:', error);
            return this.fallbackProcessJLPTReading(passage);
        }
    }

    fallbackProcessJLPTReading(passage) {
        // Fallback khi không có AI
        return {
            questions: [
                {
                    question: "Câu hỏi mẫu về bài đọc",
                    options: ["Đáp án đúng", "Đáp án sai 1", "Đáp án sai 2", "Đáp án sai 3"],
                    correctIndex: 0,
                    explanation: "Đây là đáp án đúng vì..."
                }
            ],
            grammar: {
                N5: ["は (wa) - topic marker"],
                N4: [],
                N3: [],
                N2: [],
                N1: []
            },
            vocabulary: {
                N5: [{ word: "学校", meaning: "trường học", reading: "がっこう" }],
                N4: [],
                N3: [],
                N2: [],
                N1: []
            }
        };
    }
}

module.exports = AIService;
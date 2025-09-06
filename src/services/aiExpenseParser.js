const OpenAI = require('openai');

class AIExpenseParser {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async parseExpenseFromText(text, availableJars = []) {
        try {
            // Nếu không có OpenAI API key hoặc gặp lỗi quota, sử dụng fallback parser
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
                console.log('Using fallback parser - OpenAI API not available');
                return this.fallbackParseExpense(text, availableJars);
            }

            const jarsList = availableJars.map(jar => `- ${jar.name} (${jar.percentage}% ngân sách, icon: ${jar.icon})`).join('\n');

            const prompt = `
Bạn là một trợ lý thông minh giúp phân tích thông tin chi tiêu từ câu nói tự nhiên của người Việt Nam.

DANH SÁCH CÁC HŨ CHI TIÊU HIỆN TẠI:
${jarsList}

NHIỆM VỤ:
Phân tích câu nói sau và trích xuất thông tin chi tiêu theo format JSON:

ĐẦU VÀO: "${text}"

YÊU CẦU:
1. Xác định số tiền (có thể viết tắt như 50k = 50000, 2tr = 2000000)
2. Xác định mục đích chi tiêu rõ ràng
3. Chọn hũ chi tiêu phù hợp nhất từ danh sách trên
4. Xác định danh mục chi tiêu
5. Nếu không đủ thông tin, hãy để null cho các trường đó

DANH MỤC CHI TIÊU: ["Ăn uống", "Đi lại", "Giải trí", "Mua sắm", "Sức khỏe", "Giáo dục", "Du lịch", "Nhà cửa", "Khác"]

ĐỊNH DẠNG RESPONSE (chỉ trả về JSON, không có text khác):
{
  "amount": number hoặc null,
  "description": "mô tả chi tiết",
  "jarName": "tên hũ từ danh sách" hoặc null,
  "category": "danh mục" hoặc null,
  "confidence": number từ 0-100,
  "suggestions": ["gợi ý 1", "gợi ý 2"] nếu không chắc chắn
}

VÍ DỤ:
- "Tôi vừa mua cà phê 50k" → {"amount": 50000, "description": "Mua cà phê", "jarName": "Ăn uống", "category": "Ăn uống", "confidence": 95, "suggestions": []}
- "Đổ xăng xe máy 100k" → {"amount": 100000, "description": "Đổ xăng xe máy", "jarName": "Đi lại", "category": "Đi lại", "confidence": 90, "suggestions": []}
- "Mua đồ ăn" → {"amount": null, "description": "Mua đồ ăn", "jarName": null, "category": "Ăn uống", "confidence": 60, "suggestions": ["Cần thêm thông tin số tiền", "Cần xác định hũ chi tiêu"]}
- "Đi du lịch Đà Lạt 2 triệu" → {"amount": 2000000, "description": "Đi du lịch Đà Lạt", "jarName": "Du lịch", "category": "Du lịch", "confidence": 95, "suggestions": []}
- "Mua sách 250k" → {"amount": 250000, "description": "Mua sách", "jarName": "Giáo dục", "category": "Giáo dục", "confidence": 90, "suggestions": []}
`;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một trợ lý AI chuyên phân tích chi tiêu. Hãy trả về JSON hợp lệ theo đúng format yêu cầu."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 500,
            });

            const responseText = completion.choices[0].message.content.trim();

            // Try to parse JSON response
            let parsedResult;
            try {
                // Remove any markdown formatting if present
                const cleanJson = responseText.replace(/```json\n?|\n?```/g, '');
                parsedResult = JSON.parse(cleanJson);
            } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                throw new Error('AI response format error');
            }

            // Validate and sanitize the result
            const result = {
                amount: typeof parsedResult.amount === 'number' && parsedResult.amount > 0 ? parsedResult.amount : null,
                description: typeof parsedResult.description === 'string' ? parsedResult.description.trim() : '',
                jarName: typeof parsedResult.jarName === 'string' ? parsedResult.jarName.trim() : null,
                category: typeof parsedResult.category === 'string' ? parsedResult.category.trim() : null,
                confidence: typeof parsedResult.confidence === 'number' ? Math.min(100, Math.max(0, parsedResult.confidence)) : 0,
                suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions : []
            };

            // Find matching jar by name
            if (result.jarName) {
                const matchingJar = availableJars.find(jar =>
                    jar.name.toLowerCase().includes(result.jarName.toLowerCase()) ||
                    result.jarName.toLowerCase().includes(jar.name.toLowerCase())
                );
                result.jarId = matchingJar ? matchingJar._id : null;
            }

            return result;

        } catch (error) {
            console.error('Error parsing expense with AI:', error);
            // Nếu gặp lỗi OpenAI (như quota), chuyển sang fallback
            if (error.status === 429 || error.code === 'insufficient_quota') {
                console.log('OpenAI quota exceeded, using fallback parser');
                return this.fallbackParseExpense(text, availableJars);
            }
            throw error;
        }
    }

    // Fallback parser không cần OpenAI API
    fallbackParseExpense(text, availableJars = []) {
        const result = {
            amount: null,
            description: text.trim(),
            jarName: null,
            jarId: null,
            category: null,
            confidence: 50,
            suggestions: []
        };

        // Parse số tiền từ text
        const amountPatterns = [
            /(\d+(?:\.\d+)?)\s*(?:k|nghìn)/gi,     // 50k, 30 nghìn
            /(\d+(?:\.\d+)?)\s*(?:tr|triệu)/gi,    // 2tr, 1.5 triệu
            /(\d+(?:\.\d+)?)\s*(?:m|tr)/gi,        // 2m, 1.5m
            /(\d{1,3}(?:\.\d{3})*)\s*đ/gi,         // 50.000đ
            /(\d+(?:\.\d+)?)\s*(?:ngàn|nghìn)/gi,  // 50 ngàn
            /(\d+)/gi                               // số thuần
        ];

        for (const pattern of amountPatterns) {
            const match = text.match(pattern);
            if (match) {
                let amount = parseFloat(match[0].replace(/[^\d.]/g, ''));

                // Xử lý đơn vị
                if (/k|nghìn|ngàn/i.test(match[0])) {
                    amount *= 1000;
                } else if (/tr|triệu|m/i.test(match[0])) {
                    amount *= 1000000;
                }

                result.amount = amount;
                result.confidence = 70;
                break;
            }
        }

        // Parse category dựa trên keywords
        const categoryMap = {
            'Ăn uống': ['cà phê', 'cafe', 'ăn', 'uống', 'quán', 'nhà hàng', 'trà', 'nước', 'bánh', 'cơm', 'phở', 'bún', 'mì', 'thức ăn', 'đồ ăn', 'đồ uống'],
            'Đi lại': ['xăng', 'xe', 'grab', 'taxi', 'bus', 'tàu', 'máy bay', 'di chuyển', 'đi lại', 'vé', 'xăng dầu', 'giao thông'],
            'Mua sắm': ['mua', 'shopping', 'quần áo', 'giày', 'túi', 'đồ', 'siêu thị', 'chợ', 'mall', 'mua sắm'],
            'Giải trí': ['phim', 'game', 'karaoke', 'bar', 'club', 'giải trí', 'vui chơi', 'cinema', 'rạp', 'concert'],
            'Sức khỏe': ['thuốc', 'bệnh viện', 'khám', 'y tế', 'sức khỏe', 'nha khoa', 'bác sĩ', 'chữa bệnh'],
            'Nhà cửa': ['điện', 'nước', 'gas', 'internet', 'thuê nhà', 'sửa chữa', 'tiền nhà', 'wifi', 'điện nước'],
            'Giáo dục': ['học', 'sách', 'khóa học', 'giáo dục', 'học phí', 'trường', 'đại học'],
            'Du lịch': ['du lịch', 'khách sạn', 'resort', 'tour', 'travel', 'nghỉ dưỡng', 'vacation']
        };

        const lowerText = text.toLowerCase();
        for (const [category, keywords] of Object.entries(categoryMap)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                result.category = category;
                result.confidence += 10;
                break;
            }
        }

        // Tìm jar phù hợp dựa trên tên
        if (availableJars.length > 0) {
            const matchingJar = availableJars.find(jar =>
                lowerText.includes(jar.name.toLowerCase()) ||
                jar.name.toLowerCase().includes(lowerText.split(' ')[0])
            );

            if (matchingJar) {
                result.jarName = matchingJar.name;
                result.jarId = matchingJar._id;
                result.confidence += 20;
            } else {
                // Chọn jar đầu tiên làm mặc định
                result.jarName = availableJars[0].name;
                result.jarId = availableJars[0]._id;
                result.suggestions.push(`Đã chọn hũ "${availableJars[0].name}" làm mặc định`);
            }
        }

        // Thêm suggestions nếu thiếu thông tin
        if (!result.amount) {
            result.suggestions.push('Cần thêm số tiền chi tiêu');
        }
        if (!result.category) {
            result.category = 'Khác';
            result.suggestions.push('Đã đặt danh mục mặc định là "Khác"');
        }

        return result;
    }

    async generateExpenseSuggestions(recentTransactions = [], currentJars = []) {
        try {
            // Nếu không có OpenAI API, trả về suggestions mặc định
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
                return this.getFallbackSuggestions(recentTransactions);
            }

            const recentExpenses = recentTransactions.slice(0, 10).map(t =>
                `${t.description} - ${t.amount}đ (${t.category})`
            ).join('\n');

            const prompt = `
Dựa trên lịch sử chi tiêu gần đây của người dùng, hãy đưa ra 5 gợi ý chi tiêu thông minh để người dùng có thể nói với AI:

LỊCH SỬ CHI TIÊU GẦN ĐÂY:
${recentExpenses}

Hãy trả về danh sách 5 câu gợi ý ngắn gọn, tự nhiên mà người Việt thường nói khi ghi chi tiêu:

VÍ DỤ:
- "Ăn sáng 30k"
- "Đổ xăng 100k"
- "Mua cà phê 45k"
- "Chi tiền điện tháng này 200k"
- "Đi xem phim với bạn 150k"

Chỉ trả về 5 câu, mỗi câu một dòng, không có số thứ tự:
`;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 200,
            });

            const suggestions = completion.choices[0].message.content
                .trim()
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => line.replace(/^-\s*/, '').trim())
                .slice(0, 5);

            return suggestions;

        } catch (error) {
            console.error('Error generating suggestions:', error);
            // Nếu gặp lỗi OpenAI (như quota), chuyển sang fallback
            if (error.status === 429 || error.code === 'insufficient_quota') {
                console.log('OpenAI quota exceeded for suggestions, using fallback');
            }
            return this.getFallbackSuggestions(recentTransactions);
        }
    }

    getFallbackSuggestions(recentTransactions = []) {
        // Suggestions mặc định khi không có AI
        const defaultSuggestions = [
            "Ăn sáng 30k",
            "Đổ xăng 100k",
            "Mua cà phê 45k",
            "Đi siêu thị 200k",
            "Ăn trưa 80k",
            "Taxi về nhà 50k",
            "Mua nước uống 15k",
            "Ăn tối 120k",
            "Đi xem phim 150k",
            "Mua sách 250k"
        ];

        // Nếu có lịch sử, tạo suggestions dựa trên patterns
        if (recentTransactions.length > 0) {
            const recentCategories = [...new Set(recentTransactions.slice(0, 5).map(t => t.category))];
            const customSuggestions = [];

            recentCategories.forEach(category => {
                const avgAmount = recentTransactions
                    .filter(t => t.category === category)
                    .slice(0, 3)
                    .reduce((sum, t) => sum + t.amount, 0) / 3;

                switch (category) {
                    case 'Ăn uống':
                        customSuggestions.push(`Ăn sáng ${Math.round(avgAmount / 1000)}k`);
                        break;
                    case 'Đi lại':
                        customSuggestions.push(`Đi lại ${Math.round(avgAmount / 1000)}k`);
                        break;
                    case 'Mua sắm':
                        customSuggestions.push(`Mua đồ ${Math.round(avgAmount / 1000)}k`);
                        break;
                    default:
                        customSuggestions.push(`Chi tiêu ${category.toLowerCase()} ${Math.round(avgAmount / 1000)}k`);
                }
            });

            return [...customSuggestions, ...defaultSuggestions].slice(0, 5);
        }

        return defaultSuggestions.slice(0, 5);
    }
}

module.exports = AIExpenseParser;

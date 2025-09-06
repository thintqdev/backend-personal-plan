const AIExpenseParser = require('./src/services/aiExpenseParser.js');

async function test() {
    console.log('🚀 Testing AI Fallback Parser...\n');

    const parser = new AIExpenseParser();

    const mockJars = [
        { _id: '1', name: 'Ăn uống', percentage: 30, icon: '🍽️' },
        { _id: '2', name: 'Đi lại', percentage: 20, icon: '🚗' },
        { _id: '3', name: 'Giải trí', percentage: 15, icon: '🎉' }
    ];

    const testCases = [
        'Tôi vừa mua cà phê 50k',
        'Đổ xăng xe máy 100k',
        'Ăn trưa với bạn 80 nghìn',
        'Mua sách 250k',
        'Đi xem phim 120k',
        'Đi du lịch Đà Lạt 2 triệu',
        'Tiền điện tháng này 200k',
        'Khám bệnh 300k',
        'Mua quần áo 500k'
    ];

    console.log('✅ Test Cases:');
    for (let i = 0; i < testCases.length; i++) {
        const text = testCases[i];
        console.log(`\n📝 Test ${i + 1}: "${text}"`);

        try {
            const result = await parser.parseExpenseFromText(text, mockJars);
            console.log('✅ Result:', {
                amount: result.amount,
                description: result.description,
                jarName: result.jarName,
                category: result.category,
                confidence: result.confidence,
                suggestions: result.suggestions
            });
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }

    console.log('\n🎯 Testing Suggestions...');
    try {
        const suggestions = await parser.generateExpenseSuggestions([], mockJars);
        console.log('✅ Suggestions:', suggestions);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n🎉 Test completed!');
}

test().catch(console.error);

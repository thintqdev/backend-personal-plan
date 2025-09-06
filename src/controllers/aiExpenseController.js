const AIExpenseParser = require('../services/aiExpenseParser');
const FinanceJar = require('../models/FinanceJar');
const Transaction = require('../models/Transaction');

const aiParser = new AIExpenseParser();

// Parse expense from natural language
const parseExpenseText = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung chi tiêu'
            });
        }

        // Get available jars (không cần userId)
        const jars = await FinanceJar.find({ isActive: true }).select('_id name percentage icon');

        if (jars.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Bạn chưa có hũ chi tiêu nào. Vui lòng tạo hũ chi tiêu trước.'
            });
        }

        // Parse the text using AI
        const parseResult = await aiParser.parseExpenseFromText(text, jars);

        res.json({
            success: true,
            data: parseResult,
            message: parseResult.confidence > 80
                ? 'AI đã phân tích thành công!'
                : 'AI đã phân tích nhưng cần bạn kiểm tra lại thông tin'
        });

    } catch (error) {
        console.error('Error parsing expense text:', error);

        if (error.message === 'OpenAI API key not configured') {
            return res.status(503).json({
                success: false,
                message: 'Tính năng AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
                error: 'AI_NOT_CONFIGURED'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Có lỗi khi phân tích nội dung chi tiêu',
            error: error.message
        });
    }
};// Get expense suggestions based on history
const getExpenseSuggestions = async (req, res) => {
    try {
        // Get recent transactions (không cần userId)
        const recentTransactions = await Transaction.find({})
            .sort({ date: -1 })
            .limit(20)
            .select('description amount category');

        // Get available jars (không cần userId)
        const jars = await FinanceJar.find({ isActive: true }).select('_id name percentage icon');

        // Generate suggestions using AI
        const suggestions = await aiParser.generateExpenseSuggestions(recentTransactions, jars);

        res.json({
            success: true,
            data: {
                suggestions,
                recentCount: recentTransactions.length,
                jarsCount: jars.length
            }
        });

    } catch (error) {
        console.error('Error getting expense suggestions:', error);

        // Return fallback suggestions if AI fails
        res.json({
            success: true,
            data: {
                suggestions: [
                    "Ăn sáng 30k",
                    "Đổ xăng 100k",
                    "Mua cà phê 45k",
                    "Đi siêu thị 200k",
                    "Ăn trưa 80k"
                ],
                recentCount: 0,
                jarsCount: 0,
                fallback: true
            },
            message: 'Đang sử dụng gợi ý mặc định do AI không khả dụng'
        });
    }
};

// Quick create expense from AI parsing
const createExpenseFromAI = async (req, res) => {
    try {
        const { text, override } = req.body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung chi tiêu'
            });
        }

        // Get available jars (không cần userId)
        const jars = await FinanceJar.find({ isActive: true });

        if (jars.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Bạn chưa có hũ chi tiêu nào. Vui lòng tạo hũ chi tiêu trước.'
            });
        }

        // Parse the text using AI
        const parseResult = await aiParser.parseExpenseFromText(text, jars);

        // Check if we have enough information to create transaction
        if (!parseResult.amount || !parseResult.jarId) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin chưa đầy đủ để tạo giao dịch',
                data: parseResult
            });
        }

        // Apply override if provided
        const finalData = { ...parseResult, ...override };

        // Create the transaction
        const Transaction = require('../models/Transaction');
        const newTransaction = new Transaction({
            jarId: finalData.jarId,
            amount: finalData.amount,
            type: 'expense',
            description: finalData.description || 'Chi tiêu từ AI',
            category: finalData.category || 'Khác',
            date: new Date()
        });

        await newTransaction.save();

        // Update jar amount
        const jar = await FinanceJar.findById(finalData.jarId);
        if (jar) {
            jar.currentAmount -= finalData.amount;
            await jar.save();
        }

        // Populate the transaction with jar info
        await newTransaction.populate('jarId', 'name color icon');

        res.status(201).json({
            success: true,
            data: {
                transaction: newTransaction,
                parseResult: finalData,
                aiConfidence: parseResult.confidence
            },
            message: 'Đã tạo giao dịch thành công từ AI!'
        });

    } catch (error) {
        console.error('Error creating expense from AI:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi khi tạo giao dịch từ AI',
            error: error.message
        });
    }
};

module.exports = {
    parseExpenseText,
    getExpenseSuggestions,
    createExpenseFromAI
};

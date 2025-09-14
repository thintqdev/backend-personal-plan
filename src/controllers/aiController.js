const AIService = require('../services/aiService');

const aiService = new AIService();

// Process JLPT reading passage
const processJLPTReading = async (req, res) => {
    try {
        const { passage } = req.body;

        if (!passage || typeof passage !== 'string' || passage.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập bài đọc JLPT'
            });
        }

        // Process the passage using AI
        const result = await aiService.processJLPTReading(passage);

        res.json({
            success: true,
            data: result,
            message: 'Đã xử lý bài đọc JLPT thành công!'
        });

    } catch (error) {
        console.error('Error processing JLPT reading:', error);

        if (error.message === 'OpenAI API key not configured') {
            return res.status(503).json({
                success: false,
                message: 'Tính năng AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
                error: 'AI_NOT_CONFIGURED'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Có lỗi khi xử lý bài đọc JLPT',
            error: error.message
        });
    }
};

module.exports = {
    processJLPTReading
};
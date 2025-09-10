const ActivationToken = require('../models/ActivationToken');

/**
 * Cleanup expired and used tokens
 */
const cleanupExpiredTokens = async () => {
    try {
        const result = await ActivationToken.deleteMany({
            $or: [
                { expiredAt: { $lt: new Date() } },
                { isUsed: true }
            ]
        });

        console.log(`Cleaned up ${result.deletedCount} expired/used activation tokens`);
        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
        throw error;
    }
};

/**
 * Get token statistics
 */
const getTokenStats = async () => {
    try {
        const stats = await ActivationToken.aggregate([
            {
                $group: {
                    _id: '$type',
                    total: { $sum: 1 },
                    active: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$isUsed', false] },
                                        { $gt: ['$expiredAt', new Date()] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    expired: {
                        $sum: {
                            $cond: [
                                { $lt: ['$expiredAt', new Date()] },
                                1,
                                0
                            ]
                        }
                    },
                    used: {
                        $sum: {
                            $cond: [
                                { $eq: ['$isUsed', true] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return stats;
    } catch (error) {
        console.error('Error getting token stats:', error);
        throw error;
    }
};

/**
 * Validate token without marking as used
 */
const validateToken = async (token, type) => {
    try {
        const activationToken = await ActivationToken.findOne({
            token: token,
            type: type,
            isUsed: false,
            expiredAt: { $gt: new Date() }
        }).populate('userId');

        return activationToken;
    } catch (error) {
        console.error('Error validating token:', error);
        throw error;
    }
};

module.exports = {
    cleanupExpiredTokens,
    getTokenStats,
    validateToken
};

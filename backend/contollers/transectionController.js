const addTransection = (req, res) => {
    try {
    }
    catch (error) {
        console.error('Add transection error:', error);
        res.status(500).json({
            message: 'Failed to add transection',
            error: error.message
        });
    }
};
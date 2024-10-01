const db = require("../../config/config");

const getAllAuctionBids = async (req, res) => {
    try {
        const { tender_id } = req.params;
        console.log(tender_id);

        // Early return if tender_id is not provided or invalid
        if (!tender_id) {
            return res.status(400).json({ success: false, message: "Tender ID is required." });
        }

        // Modified query to get all details for users with their lowest bid amount, including all fields from buyer table
        const query = `
            SELECT tbr.*, b.*
            FROM tender_bid_room tbr
            INNER JOIN (
                SELECT user_id, MIN(bid_amount) AS lowest_bid_amount
                FROM tender_bid_room
                WHERE tender_id = $1
                GROUP BY user_id
            ) lb
            ON tbr.user_id = lb.user_id AND tbr.bid_amount = lb.lowest_bid_amount
            INNER JOIN buyer b
            ON tbr.user_id = b.user_id
            WHERE tbr.tender_id = $1;
        `;
        const values = [tender_id];
        const result = await db.query(query, values);

        // Handle no results found
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No bids found for this tender." });
        }

        // Success response
        res.status(200).json({ success: true, allBids: result.rows });
    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
}

module.exports = { getAllAuctionBids };

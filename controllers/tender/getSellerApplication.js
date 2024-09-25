const db = require('../../config/config'); // Database configuration (replace with your actual path)

const getSubmittedTenderApplications = async (req, res) => {
  const { user_id } = req.user; // Extract `user_id` from the token

  try {
    // Step 1: Get `tender_id` from `manage_tender` table where `user_id` matches
    const tenderIdsResult = await db.query(
      `SELECT tender_id FROM manage_tender WHERE user_id = $1`,
      [user_id]
    );   

    // If no tenders found, return 404
    if (tenderIdsResult.rows.length === 0) {
      return res.status(404).send({ msg: 'No tenders found for the user', success: false });
    }

    // Extract tender_ids from the result
    const tenderIds = tenderIdsResult.rows.map(row => row.tender_id.trim());

    // Step 2: Get applications from `tender_application` table where `tender_id` matches and `status` is "submitted"
    const applicationsResult = await db.query(
      `SELECT * FROM tender_application WHERE tender_id = ANY($1::varchar[]) AND status = 'submitted'`,
      [tenderIds]
    );
    

    // If no submitted applications found, return 404
    if (applicationsResult.rows.length === 0) {
      return res.status(404).send({ msg: 'No submitted applications found for the user tenders', success: false });
    }

    res.status(200).send({
      msg: 'Submitted tender applications retrieved successfully',
      success: true,
      data: applicationsResult.rows,
    });
  } catch (error) {
    console.error('Error retrieving submitted tender applications:', error.message);
    res.status(500).send({ msg: 'Error retrieving submitted tender applications', success: false });
  }
};

module.exports = {
  getSubmittedTenderApplications,
};

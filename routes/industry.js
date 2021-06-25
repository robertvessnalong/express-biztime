const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM industries`);
    return res.json({ industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.code || !req.body.industry) {
      new ExpressError(`All data was not submitted, please retry`, 500);
    } else {
      const { code, industry } = req.body;
      const results = await db.query(
        `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`,
        [code, industry]
      );
      return res.status(201).json({ industries: results.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

router.post('/:company', async (req, res, next) => {
  try {
    if (!req.body.code) {
      new ExpressError(`All data was not submitted, please retry`, 500);
    } else {
      const { company } = req.params;
      const { code } = req.body;
      const results = await db.query(
        `INSERT INTO company_industry (industry_code, company) VALUES ($1, $2) RETURNING *`,
        [code, company]
      );
      return res.status(201).json({ industries: results.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

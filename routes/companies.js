const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);
    const id_results = await db.query(
      `SELECT * FROM invoices WHERE comp_code = $1`,
      [code]
    );
    const test = await db.query(
      `SELECT name, description, industry_code 
       FROM companies RIGHT 
       JOIN company_industry 
       ON companies.code = company_industry.company 
       WHERE companies.code = $1`,
      [code]
    );
    const industry = test.rows.map((cd) => cd.industry_code);
    if (results.rows.length === 0) {
      new ExpressError(`Cant Find Company with code of ${code}`, 404);
    }
    return res.json({
      company: results.rows[0],
      invoices: id_results.rows,
      industries: industry,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.code || !req.body.name || !req.body.description) {
      new ExpressError(`All data was not submitted, please retry`, 500);
    } else {
      const { code, name, description } = req.body;
      const results = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
        [code, name, description]
      );
      return res.status(201).json({ company: results.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

router.put('/:code', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true, remove: /[*+~.()'"!:@]/g });
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
      [name, description, slug]
    );
    if (results.rows.length === 0) {
      new ExpressError(`Cant update company with code of ${code}`, 404);
    }
    return res.status(201).send({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    if (await db.query(`SELECT code FROM companies WHERE code = $1`, [code])) {
      const results = db.query('DELETE FROM companies WHERE code = $1', [
        req.params.code,
      ]);
      return res.send({ status: 'deleted' });
    } else {
      new ExpressError(`Company does not exist`, 500);
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;

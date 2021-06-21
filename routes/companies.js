const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

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
    if (results.rows.length === 0) {
      new ExpressError(`Cant Find Company with code of ${code}`, 404);
    }
    return res.json({ company: results.rows[0], invoices: id_results.rows });
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
      if (
        await db.query(`SELECT code FROM companies WHERE code = $1`, [code])
      ) {
        new ExpressError(`Company already exist`, 500);
      }
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
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
      [name, description, code]
    );
    if (results.rows.length === 0) {
      new ExpressError(`Cant update company with code of ${code}`, 404);
    }
    return res.send({ user: results.rows[0] });
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

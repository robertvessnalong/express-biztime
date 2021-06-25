const e = require('express');
const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [
      id,
    ]);
    if (results.rows.length === 0) {
      new ExpressError(`Cant Find Invoice with id of ${code}`, 404);
    }
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.comp_code || !req.body.amt) {
      new ExpressError(`All data was not submitted, please retry`, 500);
    } else {
      const { comp_code, amt } = req.body;
      const results = await db.query(
        `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`,
        [comp_code, amt]
      );
      return res.status(201).json({ invoice: results.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    let paid;
    if (amt) {
      paid = new Date().toISOString().split('T')[0];
    } else {
      paid = null;
    }
    const results = await db.query(
      `UPDATE invoices SET amt=$1, paid_date=$2 WHERE id=$3 RETURNING *`,
      [amt, paid, id]
    );
    console.log(paid);
    if (results.rows.length === 0) {
      new ExpressError(`Cant update invoice with id of ${id}`, 404);
    }
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (
      (await db.query('SELECT * FROM invoices WHERE id = $1', [id])).rows
        .length !== 0
    ) {
      const results = await db.query('DELETE FROM invoices WHERE id = $1', [
        id,
      ]);
      return res.send({ status: 'deleted' });
    } else {
      new ExpressError(`Can't Find Invoice`, 404);
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;

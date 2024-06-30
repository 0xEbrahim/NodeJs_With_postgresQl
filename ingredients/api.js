const path = require("path");
const express = require("express");
const router = express.Router();
const pg = require("pg");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);

/**
 * Student code starts here
 */

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5432,
});

router.get("/type", async (req, res) => {
  const { type } = req.query;
  console.log("get ingredients", type);

  const { rows } = await pool.query("SELECT * FROM ingredients WHERE type=$1", [
    type,
  ]);
  res.json({ rows }).end();
  //res.status(501).json({ status: "not implemented", rows: [] });
});

router.get("/search", async (req, res) => {
  let { term, page } = req.query;
  page = page ? page : 0;
  const params = [page * 5];
  console.log("search ingredients", term, page);
  let whereCond;
  if (term) {
    whereCond = "WHERE CONCAT(title, type) ILIKE $2";
    params.push(`%${term}%`);
  }
  // return all columns as well as the count of all rows as total_count
  const { rows } = await pool.query(
    `SELECT *, (SELECT total_count FROM (SELECT COUNT(*) AS total_count FROM ingredients ${whereCond}) AS XD )  FROM ingredients ${whereCond} OFFSET $1 LIMIT 5`,
    params
  );
  // make sure to account for pagination and only return 5 rows at a time
  res.json({ rows }).end();
  //res.status(501).json({ status: "not implemented", rows: [] });
});

/**
 * Student code ends here
 */

module.exports = router;

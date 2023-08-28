const argon2 = require("argon2")
const jwt = require("jsonwebtoken")

// const database = require("./database")
const auth = async (req, res) => {
  const user = req.user

  if (await argon2.verify(user.hashed_password, req.body.password)) {
    const token = jwt.sign(
      { sub: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
      process.env.JWT_SECRET
    )
    delete user.hashed_password
    res.status(200).send({ token, user: user })
  } else {
    res.sendStatus(401)
  }
  // database
  //   .query(
  //     where.reduce(
  //       (sql, { column, operator }, index) =>
  //         `${sql} ${index === 0 ? "where" : "and"} ${column} ${operator} ?`,
  //       initialSql
  //     ),
  //     where.map(({ value }) => value)
  //   )
  //   .then(([users]) => {
  //     res.json(users)
  //   })
  //   .catch((err) => {
  //     console.error(err)
  //     res.status(500).send("Error retrieving data from database")
  //   })
}

module.exports = {
  auth,
}

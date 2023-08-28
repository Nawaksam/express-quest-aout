const database = require("./database")

const getUsers = (req, res) => {
  const initialSql =
    "select firstname, lastname, email, city, language from users"
  const where = []

  if (req.query.city != null) {
    where.push({
      column: "city",
      value: req.query.city,
      operator: "=",
    })
  }
  if (req.query.language != null) {
    where.push({
      column: "language",
      value: req.query.language,
      operator: "=",
    })
  }

  database
    .query(
      where.reduce(
        (sql, { column, operator }, index) =>
          `${sql} ${index === 0 ? "where" : "and"} ${column} ${operator} ?`,
        initialSql
      ),
      where.map(({ value }) => value)
    )
    .then(([users]) => {
      res.json(users)
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send("Error retrieving data from database")
    })
}

const getUserById = (req, res) => {
  const id = parseInt(req.params.id)

  database
    .query(
      "select firstname, lastname, email, city, language from users where id = ?",
      [id]
    )
    .then(([users]) => {
      if (users[0] != null) {
        res.json(users[0])
      } else {
        res.status(404).send("Not Found")
      }
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send("Error retrieving data from database")
    })
}

const postUser = (req, res) => {
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body

  database
    .query(
      "INSERT INTO users(firstname, lastname, email, city, language, hashed_password) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([result]) => {
      res.location(`/api/users/${result.insertId}`).sendStatus(201)
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send("Error saving the user")
    })
}

const updateUser = (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { firstname, lastname, email, city, language, hashedPassword } =
      req.body
    const { sub } = req.payload
    if (id === sub) {
      database
        .query(
          "update users set firstname = ?, lastname = ?, email = ?, city = ?, language = ?, hashed_password = ? where id = ?",
          [firstname, lastname, email, city, language, hashedPassword, id]
        )
        .then(([result]) => {
          if (result.affectedRows === 0) {
            res.status(404).send("Not Found")
          } else {
            res.sendStatus(204)
          }
        })
    } else {
      throw new Error("")
    }
  } catch (err) {
    console.error(err)
    res.status(404).send("Id and payload mismatch")
  }
}

const deleteUser = (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { sub } = req.payload

    if (id === sub) {
      database
        .query("delete from users where id = ?", [id])
        .then(([result]) => {
          if (result.affectedRows === 0) {
            res.status(404).send("Not Found")
          } else {
            res.sendStatus(204)
          }
        })
    } else {
      throw new Error("")
    }
  } catch (err) {
    console.error(err)
    res.status(403).send("Id and payload Mismatch")
  }
}

const retrieveUser = async (req, res, next) => {
  const { email } = req.body

  try {
    await database
      .query("select * from users where email = ?", [email])
      .then(([result]) => {
        if (result[0] !== null) {
          req.user = result[0]
        } else {
          res.sendStatus(404)
        }
      })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error retrieving password")
  }

  next()
}

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
  retrieveUser,
}

const argon2 = require("argon2")
const jwt = require("jsonwebtoken")

// const database = require("./database")
const auth = async (req, res) => {
  const user = req.user

  const isVerified = await argon2.verify(
    user.hashed_password,
    req.body.password
  )

  if (isVerified) {
    const payload = {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET)

    delete user.hashed_password

    res.status(200).send({ token, user: user })
  } else {
    res.sendStatus(401)
  }
}

module.exports = {
  auth,
}

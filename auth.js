const jwt = require("jsonwebtoken")
const argon2 = require("argon2")

const argonOptions = {
  type: argon2.argon2id,
  memoryCost: 20000,
  timeCost: 2,
  parallelism: 1,
}

const hashPassword = async (req, res, next) => {
  try {
    const hash = await argon2.hash(req.body.password, argonOptions)
    console.log(hash)
    req.body.hashedPassword = hash
    delete req.body.password
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }

  next()
}

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization")

    if (authHeader == null) {
      throw new Error("No authorization header")
    }

    const [type, token] = authHeader.split(" ")

    if (type !== "Bearer") {
      throw new Error("Not bearer auth")
    }

    req.payload = jwt.verify(token, process.env.JWT_SECRET)

    next()
  } catch (err) {
    console.error(err)
    res.sendStatus(401)
  }
}

module.exports = { hashPassword, verifyToken }

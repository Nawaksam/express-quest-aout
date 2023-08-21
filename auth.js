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

module.exports = { hashPassword }

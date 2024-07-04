import bcrpyt from 'bcrypt'

const saltRounds = 10

export const hashPassword = (password) => {
    const salt = bcrpyt.genSaltSync(saltRounds)
    console.log(salt)
    return bcrpyt.hashSync(password, salt)
}

export const comparePassword = (plain, hashed) => {
    return bcrpyt.compareSync(plain, hashed)
}
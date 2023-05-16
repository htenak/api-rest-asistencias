// dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// clave secreta
const secret = "CLaVe_GeSToR_De_aSiSTeNCiaS_1305";

// funcion para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        cycle: user.cycle,
        dni: user.dni,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    }

    // devolver jwt token codificado
    return jwt.encode(payload, secret);

}


module.exports = {
    secret,
    createToken
}
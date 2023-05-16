// imports
const jwt = require("jwt-simple");
const moment = require("moment");

const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// middlewar de autenticación
exports.auth = (req, res, next) => {
    // comprobar si llega cabecera de autenticación
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "La petición no tiene la cabecera de autenticación"
        });
    }

    // limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '');

    // decodificar token
    try{
        let payload = jwt.decode(token, secret);

        // comprobar expiración del token
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
            });
        }

        // agregar datos de usuario al request user
        req.user = payload;

    }catch(err){
        return res.status(404).send({
            status: "error",
            message: "Token inválido",
            err
        });
    }

    // pasar a la ejecucion de la acción
    next();

}


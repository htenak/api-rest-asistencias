const mongoose = require("mongoose");

const connection = async() => {
    const uri = "mongodb://127.0.0.1:27017/attends_nor";
    try{
        await mongoose.connect(uri);
        console.log("Conexion a la base de datos exitosa");

    }catch(err){
        console.log(err);
        throw new Error("No se pudo conectar a la base de datos...")
    }
}

module.exports = {
    connection
}
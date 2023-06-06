const mongoose = require("mongoose");

const connection = async() => {
    const uri = "mongodb+srv://kaneth:kaneth_1305@cluster0.eyg5j4m.mongodb.net/attendsitedb?retryWrites=true&w=majority";
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
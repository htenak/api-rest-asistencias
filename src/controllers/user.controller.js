const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("../services/jwt");

// ruta de prueba
const test =  (req, res) => {
    res.send("Ruta de prueba Usuario");
}

// registrar 
const register = async(req, res) => {
    // recoger datos
    let { name, lastname, dni, role, cycle } = req.body;

    name = name.toUpperCase();
    lastname = lastname.toUpperCase();
    if(cycle){
        cycle = cycle.toUpperCase();
    }

    if(!name || !lastname || !dni || !role) return res.status(500).send({ status: "error", message: "Los campos son obligatorios" });

    // validar que DNI sea de 8 digitos y tenga solo números
    var regex = /\D/;
    if (regex.test(dni) || dni.length != 8) {
        return res.status(500).send({
            status: "error",
            message: "El DNI debe ser de 8 digitos y contener solo números"
        });
    }

    try {
        // buscar si existe dni en db
        const exist_dni = await User.find({ 
            "dni": dni
        });

        // controlar duplicidad de dni
        if(exist_dni && exist_dni.length >= 1){
            return res.status(400).send({
                status: "error",
                message: "El DNI ya existe en el sistema"
            });
        }
        
        // rol por defecto
        if(!role) role = "student";

        // controlar roles
        if(role !== "student" && role !== "professor" && role !== "admin"){
            return res.status(400).send({
                status:  "error",
                message: "El rol de usuario no es válido"
            });
        }
        
        // cifrar clave
        const pass = await bcrypt.hash(dni, 10);
        let password = pass;

        // crear objeto (con ciclo si es rol student)
        if(role == "student"){
            // validar ciclo
            if(cycle !== "I" && cycle !== "II" && cycle !== "III" && cycle !== "IV" && cycle !== "V" && cycle !== "VI"){
                return res.status(400).send({
                    status: "error",
                    message: "El ciclo es inválido"
                });
            }

            let user_new = new User({
                name,
                lastname,
                dni,
                password,
                role,
                cycle
            });
            
            // guardar usuario en db y devolver resultado
            const user_saved = await user_new.save();
            if(user_saved) {
                return res.status(200).json({
                    status: "success",
                    message: "Usuario registrado con exito",
                    user: user_saved
                });
            }

        }else{

            let user_new = new User({
                name,
                lastname,
                dni,
                password,
                role
            });
            
            // guardar usuario en db y devolver resultado
            const user_saved = await user_new.save();
            if(user_saved) {
                return res.status(200).json({
                    status: "success",
                    message: "Usuario registrado con exito",
                    user: user_saved
                });
            }
        }

    }catch(err){
        res.status(400).send({
            status: "error",
            message: "No se pudo registrar al usuario"
        });
    }
    
}

// iniciar sesión
const login = async(req, res) => {
    // recoger datos
    let { dni, password } = req.body;

    if(!dni || !password) return res.status(500).send({ status: "error", message: "Los campos son obligatorios" });

    try {
        // buscar existencia de dni en db
        const exist_user = await User.findOne({ "dni": dni });

        if(!exist_user){
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            });
        }

        // comprobar pass correcta
        const pass = bcrypt.compareSync(password, exist_user.password);
        if(!pass){
            return res.status(400).send({
                status: "error",
                message: "Los datos son incorrectos"
            });
        }

        // crear token de usuario logueado
        const token = jwt.createToken(exist_user);

        // devolver resultado
        return res.status(200).send({
            status: "success",
            message: "Identificación exitosa",
            user: {
                id: exist_user._id,
                name: exist_user.name,
                lastname: exist_user.lastname,
                cycle: exist_user.cycle,
                dni: exist_user.dni,
                role: exist_user.role
            },
            token
        });

    }catch(err){
        return res.status(404).send({
            status: "error", 
            message: "Error en la consulta"
        });
    }

}

// actualizar clave
const update = async(req, res) => {
    // recoger datos de usuario
    const { id } = req.user;

    // recoger datos a actualizar
    let { password } = req.body;
    
    if(!password) return res.status(500).send({ status: "error", message: "El campo está vacio" });

    try {
        // cifrar la password a actualizar
        if(password){
            const new_pass = await bcrypt.hash(password, 10);
            password = new_pass;
        }
        
        // buscar usuario logueado y actualizar password
        const updated_user = await User.findByIdAndUpdate(
            { "_id": id },
            { "password": password },
            { new: true }    
        );
        
        if(!updated_user) return res.status(500).send({ status: "error", message: "No se pudo actualizar tu clave" });

        // devolver resultado
        return res.status(200).send({
            status: "success",
            message: "Tu clave fue actualizada con exito"
        });

    }catch(err){
        return res.status(500).send({
            status: "error",
            message: "Error al actualizar el usuario"
        });
    }
    
}

// perfil
const profile = async(req, res) => {
    // recoger datos de usuario logueado
    const { id } = req.user;
    
    try{
        // buscar usuario en db
        const exist_user = await User.findById({ "_id": id })
            .select({ password: 0 });

        return res.status(200).send({
            status: "success",
            user: exist_user
        });

    }catch(err){
        return res.status(404).send({
            status: "error",
            message: "Error en la consulta"
        });
    }

}

// eliminar usuario (solo rol admin pueden hacerlo)
const remove = async(req, res) => {
    // recoger rol de usuario logueado
    const { id, role } = req.user;

    // recoger id de usuario a eliminar
    let id_to_remove = req.params.id;

    // varificar que el usuario es admin
    if(role !== "admin") {
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de rol 'admin' pueden eliminar usuarios"
        });
    }

    try{
        // buscar usuario a eliminar
        const user_to_remove = await User.findById({"_id": id_to_remove});
        
        // verficar que existe usuario a eliminar
        if(!user_to_remove) return res.status(404).send({status: "error", message: "El usuario a eliminar no existe"});
        
        // validar que un usuario no se elimine a si mismo
        if(user_to_remove._id == id){
            return res.status(500).send({
                status: "error",
                message: "No puedes auto eliminarte"
            });
        }

        // eliminar usuario y devolver resultado
        const user_removed = await User.findByIdAndDelete({"_id": user_to_remove._id})
            .select({ password: 0 });

        return res.status(200).send({
            status: "success",
            message: "El usuario fue eliminado con éxito",
            userDeleted: user_removed
        });

    }catch(err){
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el usuario"
        });
    }

}

// listar usuarios (vista para admin)
const users = async(req, res) => {

    const { id, role } = req.user;

    // validar que solo admins puedan ver a otros usuarios
    if(role !== "admin"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo admin pueden ver a otros usuarios"
        });
    }

    try{
        // consultar usuarios
        const users = await User.find({ 
            "_id": { $ne: id }  // excluye de la consulta al id logueado
        })
        .sort({ "name": 1 });   // orden alfabetico

        // si no hay usuarios
        if(users.length < 1){
            return res.status(200).send({
                status: "success",
                message: "Aún no hay otros usuarios registrados"
            });
        }

        return res.status(200).send({
            status: "success",
            users: users,
            total: users.length
        });

    }catch(err){
        return res.status(404).send({
            status: "error",
            message: "Error en la consulta"
        });
    }

}

// listar profesores para campo professor (select en agregar curso)
const professors = async(req, res) => {
    // recoger usuario
    const { role } = req.user;

    // validar rol de usuario
    if(role !== "admin"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo admin pueden ver a los profesores registrados"
        });
    }
        
    try{
        // buscar y popular profesores
        const exist_prof = await User.find({ "role": "professor" })
            .select({ "name": 1, "lastname": 1, "role": 1 })
            .sort({ "name": 1 });
        
        // si no hay profesores registrados
        if(exist_prof.length < 1){
            return res.status(200).send({
                status: "success",
                message: "Aún no hay profesores registrados"
            });
        }
        
        return res.status(200).send({
            status: "success",
            professors: exist_prof
        });
        
    }catch(err){
        return res.status(400).send({
            status: "error",
            message: "Error en la consulta"
        });
    }

}


module.exports = {
    test,
    register,
    login,
    update,
    profile,
    remove,
    users,
    professors
};
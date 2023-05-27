const User = require("../models/User");
const Course = require("../models/Course");
const Attend = require("../models/Attend");

// ruta de prueba
const test = (req, res) => {
    res.send("Ruta de prueba Asistencia");
}

// registrar asistencia
const register = async(req, res) => {
    // recoger usuario
    const { id, role, cycle } = req.user;

    // validar rol de usuario
    if(role !== "student"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo student pueden registrar asistencias"
        });
    }

    // recoger datos del formulario
    let { professor, course } = req.body;

    if(!professor || !course){
        return res.status(400).send({
            status: "error",
            situation: "vacios",
            message: "Todos los campos son obligatorios"
        });
    }

    try{
        // que el profesor realmente exista
        const exist_prof = await User.findById(professor);
        if(exist_prof.role !== "professor"){
            return res.status(400).send({
                status: "error",
                message: "El profesor seleccionado no existe"
            });
        }
        
        // que el curso y profesor realmente exista segun el ciclo del estudiante
        const exist_course = await Course.findOne({ "_id": course, "cycle": cycle, "professor": professor });
        if(!exist_course){
            return res.status(400).send({ 
                status: "error", 
                situation: "diferentes",
                message: "El profesor o curso seleccionado pertenece a un ciclo distinto" 
            });
        }

        // crear objeto
        const new_attend = new Attend({
            student: id,
            course,
            professor,
            cycle
        });

        // guardar objeto
        const saved_attend = await new_attend.save();

        // respuesta
        return res.status(200).send({ 
            status: "success", 
            message: "Asistencia guardada con exito",
            savedAttend: saved_attend
        });

    }catch(err){
        return res.status(400).send({
            status: "error",
            message: "Error al registrar la asistencia"
        });
    }

}

// ver todas las asistencias (para admin)
const attends = async(req, res) => {
    // recoger usuario
    const { role } = req.user;

    // validar rol de usuario
    if(role !== "admin"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo admin pueden ver todas las asistencias"
        });
    }

    try{
        // consulta de asistencias
        const exist_attends = await Attend.find({})
            .populate("student professor course", "name lastname")
            .sort({"date": -1});
        
        if(exist_attends.length < 1) {
            return res.status(500).send({ 
                status: "error", 
                message: "Aún no hay asistencias registradas" 
            });
        }
            
        // recorrer asistecnias y dar fomato a fecha
        const attends_formated = exist_attends.map(attends => ({
            ...attends._doc,    // ...attends para copiar todas las propiedades encontradas y ._doc para acceder a la info
            date: attends.date.toLocaleString()
        }));

        return res.status(200).send({
            status: "success",
            total: attends_formated.length,
            attends: attends_formated
        });

    }catch(err){
        return res.status(400).send({
            status: "error",
            message: "Error en la consulta"
        });
    }

}

// asistencias de estudiante
const myAttends = async(req, res) => {
    const { id, role } = req.user;

    if(role !== "student"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo student pueden ver sus asistencias"
        });
    }

    try{
        // consulta
        const attends_student = await Attend.find({"student": id})
            .populate("professor course", "name lastname")
            .sort({"date": -1});

        if(attends_student.length < 1){
            return res.status(200).send({
                status: "success",
                message: "Aún no has registrado asistencias"
            });
        }

        // recorrer asistecnias y dar fomato a fecha
        const attends_formated = attends_student.map(attends => ({
            ...attends._doc,    // ...attends para copiar todas las propiedades encontradas y ._doc para acceder a la info
            date: attends.date.toLocaleString()
        }));

        // resultado
        return res.status(200).send({
            status: "success",
            total: attends_formated.length,
            attendsStudent: attends_formated
        });

    }catch(err){
        return res.status(400).send({
            status: "error",
            message: "Error en la consulta"
        });
    }

}

// asistencias que verán los profesores
const courseAttends = async(req, res) => {
    const { id, role } = req.user;
    if(role !== "professor"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo professor pueden ver asistencias en sus cursos"
        });
    }
    
    try{
        // consulta
        const course_attends = await Attend.find({ "professor": id })
            .populate("student course", "name lastname")
            .sort({"date": -1});

        if(course_attends.length < 1){
            return res.status(200).send({
                status: "success",
                message: "Aún no hay asistencias en tus cursos"
            });
        }

        // recorrer asistecnias y dar fomato a fecha
        const attends_formated = course_attends.map(attends => ({
            ...attends._doc,    // ...attends para copiar todas las propiedades encontradas y ._doc para acceder a la info
            date: attends.date.toLocaleString()
        }));

        // resultado
        return res.status(200).send({
            status: "success",
            total: attends_formated.length,
            attendsStudent: attends_formated
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
    attends,
    myAttends,
    courseAttends
}
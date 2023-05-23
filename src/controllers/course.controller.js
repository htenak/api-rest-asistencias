const User = require("../models/User");
const Course = require("../models/Course");
const Attend = require("../models/Attend");

// ruta de prueba
const test = (req, res) => {
    res.send("Ruta de prueba Curso");
}

// agregar curso
const add = async(req, res) => {
    // recoger usuario
    const { role } = req.user;

    // validar rol de usuario
    if(role !== "admin"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo admin pueden añadir cursos"
        });
    }

    // recoger datos de formulario
    let { name, professor, cycle } = req.body;
    
    if(!name || !professor || !cycle) return res.status(400).send({ status: "error", message: "Campos vacíos" }); 
    
    name = name.toUpperCase();
    cycle = cycle.toUpperCase();

    try{
        // validar que profesor seleccionado exista en db
        const exist_prof = await User.findById(professor);
        
        if(exist_prof.role !== "professor"){
            return res.status(400).send({
                status: "error",
                message: "El profesor seleccionado no existe"
            });
        }

        // validar ciclo
        if(cycle !== "I" && cycle !== "II" && cycle !== "III" && cycle !== "IV" && cycle !== "V" && cycle !== "VI"){
            return res.status(400).send({
                status: "error",
                message: "El ciclo seleccionado es inválido"
            });
        }

        // buscar si existe el curso por nombre, profesor y ciclo
        const exist_course = await Course.findOne({ 
            name,
            professor,
            cycle
        });

        if(exist_course){
            return res.status(400).send({
                status: "error",
                message: "El curso ya existe"
            });
        }

        const new_course = new Course({
            name,
            professor,
            cycle
        });

        const saved_course = await new_course.save();

        return res.status(200).send({
            status: "success",
            message: "Curso agregado con exito",
            course: saved_course.name,
            cycle: saved_course.cycle,
            professor: (exist_prof.name + " " + exist_prof.lastname)
        });

    }catch(err){
        console.log(err)
        return res.status(400).send({
            status: "error",
            message: "Error al guardar curso"
        });
    }
    
}

// ver todos los cursos (calquier rol puede acceder)
const courses = async(req, res) => {
    try{
        // consultar cursos
        const exist_courses = await Course.find({})
            .select({"name": 1, "professor": 1, "cycle": 1})
            .populate('professor', 'name lastname')  // del objeto professor conseguir su name y lastname
            .sort({"name": 1});

        // si no hay cursos
        if(exist_courses.length < 1){
            return res.status(200).send({
                status: "success",
                message: "Aún no hay cursos registrados"
            });
        }

        // resultado
        return res.status(200).send({
            status: "success",
            courses: exist_courses,
            total: exist_courses.length
        });

    }catch(err){
        console.log(err)
        return res.status(404).send({
            status: "error",
            message: "Error en la consulta"
        });
    }
}

// actualizar curso
const update = async(req, res) => {

    const { role } = req.user;

    // validar rol de usuario
    if(role !== "admin"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo admin pueden actualizar cursos"
        });
    }

    // recoger id de url
    let { id } = req.params;

    // recoger datos de formulario
    let { name, professor, cycle } = req.body;

    // validar que lleguen todos los campos
    if (!name || !professor || !cycle) {
        return res.status(400).send({ status: "error", message: "Todos los campos son obligatorios" });
    }

    name = name.toUpperCase();
    cycle = cycle.toUpperCase();

    try{
        // validar que profesor seleccionado exista en db
        const exist_prof = await User.findById(professor);
        if(exist_prof.role !== "professor"){
            return res.status(500).send({
                status: "error",
                message: "El profesor seleccionado no existe"
            });
        }

        // validar ciclo
        if(cycle !== "I" && cycle !== "II" && cycle !== "III" && cycle !== "IV" && cycle !== "V" && cycle !== "VI"){
            return res.status(500).send({
                status: "error",
                message: "El ciclo seleccionado es inválido"
            });
        }

        // buscar si existe el curso por nombre, profesor y ciclo
        const exist_course = await Course.findOne({ 
            name,
            professor,
            cycle
        });

        if(exist_course){
            return res.status(400).send({
                status: "error",
                message: "El curso ya existe"
            });
        }

        // actualizar curso
        const updated_course = await Course.findByIdAndUpdate(
            { "_id": id },
            { "name": name, "professor": professor, "cycle": cycle },
            { new: true }
        );

        // resultado
        return res.status(200).send({
            status: "success",
            message: "El curso fue actualizado correctamente",
            updatedCourse: updated_course
        });

    }catch(err){
        return res.status(400).send({
            status: "error",
            message: "Error al actualizar el curso"
        });
    }

}

// eliminar curso
const remove = async(req, res) => {
    const { role } = req.user;

    // validar rol de usuario
    if(role !== "admin"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo admin pueden eliminar cursos"
        });
    }

    const { id } = req.params;

    try{
        // consultar a db y eliminar
        const deleted_course = await Course.findByIdAndDelete({"_id": id});
        if(!deleted_course){
            return res.status(500).send({
                status: "error",
                message: "El curso ya fue eliminado"
            });
        }

        // resultado
        return res.status(200).send({
            status: "success",
            deletedCourse: deleted_course
        });

    }catch(err){
        console.log(err)
        return res.status(400).send({
            status: "error",
            message: "Error al eliminar el curso"
        });
    }

}

// ver cursos y profesores por ciclo (ciclo del estudiante) para registro de asistencia
const cycleCourses = async(req, res) => {
    // recoger usuario
    const { name, lastname, cycle, role } = req.user;

    // validar rol de usuario
    if(role !== "student"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo student pueden ver cursos de acuerdo a su ciclo"
        });
    }

    try{
        // consulta a cursos de acuerdo a ciclo del estudiante
        const cycle_courses = await Course.find({ "cycle": cycle })
            .select({ "name": 1, "professor": 1, "cycle": 1 })
            .populate("professor", "name lastname cycle")
            .sort({ "name": 1 });

        if(cycle_courses.length < 1){
            return res.status(200).send({ 
                status: "success", 
                message: "Aun no hay cursos para tu ciclo" 
            });
        }

        // respuesta
        return res.status(200).send({
            status: "success",
            student: name + " " + lastname,
            total: cycle_courses.length,
            cycleCourses: cycle_courses
        });

    }catch(err){
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta"
        });
    }

}

// cursos en los que el estudiante asistió
const myCourses = async(req, res) => {

    const { id, role } = req.user;
    if(role !== "student"){
        return res.status(401).send({
            status: "error",
            message: "Solo usuarios de tipo student pueden ver los cursos a los que asistieron"
        });
    }

    try{
        const my_courses_attends = await Attend.find({ "student": id })
            .select({ course: 1 })
            .populate("course", "name")
            .sort({ "course.name": 1 });

        
        if(my_courses_attends.length < 1){
            return res.status(200).send({
                status: "success",
                message: "Aún no hay cursos en los que hayas asistido"
            });
        }

        // crear un Set para almacenar los cursos unicos
        const unique_courses = new Set();

        // filtrar y obtener solo los cursos unicos
        const my_courses = my_courses_attends.filter((attend) => {
            const course_id = attend.course._id.toString();

            if(unique_courses.has(course_id)){
                return false; // si ya tiene el curso no la agrega al Set()
            }else{
                unique_courses.add(course_id);
                return true; // si aun no tiene el curso lo agrega al Set()
            }
        });
        
        return res.status(200).send({
            status: "success",
            total: my_courses.length,
            myCourses: my_courses
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
    add,
    courses,
    update,
    remove,
    cycleCourses,
    myCourses
}
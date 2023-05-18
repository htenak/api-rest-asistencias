// dependencias
const express = require("express");
const cors = require("cors");

// database
const { connection } = require("./database/connection");

// importando rutas
const UserRoutes = require("./routes/user.routes");
const CourseRoutes = require("./routes/course.routes");
const AttendRoutes = require("./routes/attend.routes");

// conexion a db
connection();


// creando server
const app = express();
const port = 5000;


// configurar cors
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Cambia esto a tu dominio específico si corresponde
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});


// convertir datos del body a json
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// rutas usuario
app.use("/api/user", UserRoutes);

// rutas curso
app.use("/api/course", CourseRoutes);

// rutas asistencia
app.use("/api/attend", AttendRoutes);


// corriendo server
app.listen(port, () => {
    console.log(`Server en el puerto ${port}`);
});
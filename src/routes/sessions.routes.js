import passport from "passport";
import { Router } from "express";
import User from "../models/users.model.js";
import jwt from "jsonwebtoken";
import { createHash, isValidPassword } from "../utils/util.js";
import cartsModel from "../models/carts.model.js";

const router = Router();

router.post("/login", async (req, res) => {
    try {
        const { usuario, password } = req.body;
        const user = await User.findOne({usuario});
        if (!user) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }
        if (!isValidPassword(password, user)) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        // Generar token
        const token = jwt.sign({ usuario: user.usuario, rol: user.rol }, "coderhouse", { expiresIn: "1h" });

        res.cookie("coderCookieToken", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/api/sessions/current");
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.post("/register", async (req, res) => {
    try {
        // Desestructurar los nuevos campos del cuerpo de la solicitud
        const { usuario, password, first_name, last_name, email, age } = req.body;

        // Verificar que el correo no esté ya registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        // Crear el carrito
        const nuevoCarrito = await cartsModel.create({});

        // Crear el nuevo usuario con los nuevos campos
        const user = new User({
            usuario,
            password: createHash(password),
            first_name,
            last_name,
            email,
            age,
            cart: nuevoCarrito._id
        });

        // Guardar el usuario
        await user.save();

        // Redirigir a la página de login
        res.redirect("/login");

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("coderCookieToken");
    res.redirect("/login");
});

// Armo la ruta Current
router.get("/current", passport.authenticate("current",{session: false}), (req, res) => {
    if (req.user) {
        res.render("profile", { user: req.user.usuario });
    } else {
        res.status(401).json({ message: "Usuario no autorizado" });
    }
});

// Verifico que el usuario sea admin
router.get("/admin", passport.authenticate("current",{session: false}), (req, res) => {
    if(req.user.rol !== "admin"){
        return res.status(403).send("Usuario no autorizado");
    }
    res.render("admin");
});

export default router;

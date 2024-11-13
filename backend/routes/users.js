const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const connection = require('../config/db'); // Asegúrate de que este archivo existe y exporta la conexión a la base de datos
const User = require('../models/User'); // Importar el modelo de usuario

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findByUsername(username); // Buscar usuario en la base de datos
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear un nuevo usuario en la base de datos
        const newUser = await User.create(username, password);
        res.status(201).json({ message: 'Usuario creado exitosamente', userId: newUser.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscar usuario por nombre de usuario
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Comparar la contraseña ingresada con la almacenada en la base de datos
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Si la contraseña coincide, iniciar sesión exitosamente
        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// Ruta para eliminar un usuario
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Ejecutar la consulta para eliminar al usuario por su ID
        connection.query('DELETE FROM users WHERE id = ?', [userId], (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Error al eliminar el usuario' });
            }

            // Verificar si se eliminó algún registro
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;

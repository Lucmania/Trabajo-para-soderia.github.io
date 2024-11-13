const connection = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    // Crear un nuevo usuario con contraseña encriptada
    static async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la contraseña

        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, hashedPassword],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });
    }

    // Buscar un usuario por su nombre de usuario
    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users WHERE username = ?',
                [username],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results[0]); // Devolver el primer resultado
                }
            );
        });
    }
}

module.exports = User;

const connection = require('../config/db');

class Producto {
    static create(data) {
        return new Promise((resolve, reject) => {
            const { nombre, precio, descripcion } = data;
            connection.query(
                'INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)',
                [nombre, precio, descripcion],
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                }
            );
        });
    }

    static findAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM productos', (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            const { nombre, precio, descripcion } = data;
            connection.query(
                'UPDATE productos SET nombre = ?, precio = ?, descripcion = ? WHERE id = ?',
                [nombre, precio, descripcion, id],
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM productos WHERE id = ?', [id], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }
}

module.exports = Producto;

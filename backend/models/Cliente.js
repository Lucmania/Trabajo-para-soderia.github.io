const connection = require('../config/db');

class Cliente {
    static create(data) {
        return new Promise((resolve, reject) => {
            const { nombre_apellido, telefono, email, ciudad, barrio, calle_altura, piso, departamento } = data;
            connection.query(
                'INSERT INTO clientes (nombre_apellido, telefono, email, ciudad, barrio, calle_altura, piso, departamento, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [nombre_apellido, telefono, email, ciudad, barrio, calle_altura, piso, departamento, 'habilitado'],
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                }
            );
        });
    }

    static findAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM clientes WHERE estado = "habilitado"', (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    static findByEstado(estado) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM clientes WHERE estado = ?', [estado], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            const { nombre_apellido, telefono, email, ciudad, barrio, calle_altura, piso, departamento } = data;
            connection.query(
                'UPDATE clientes SET nombre_apellido = ?, telefono = ?, email = ?, ciudad = ?, barrio = ?, calle_altura = ?, piso = ?, departamento = ? WHERE id = ?',
                [nombre_apellido, telefono, email, ciudad, barrio, calle_altura, piso, departamento, id],
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM clientes WHERE id = ?', [id], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    static toggleEstado(id, estado) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE clientes SET estado = ? WHERE id = ?', [estado, id], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }
}

module.exports = Cliente;

const connection = require('../config/db');

class Recorrido {
    // Crear un nuevo recorrido con sus pedidos
    static create(data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Iniciar transacción
                await new Promise((res, rej) => {
                    connection.beginTransaction(err => {
                        if (err) rej(err);
                        res();
                    });
                });

                // Insertar el recorrido
                const recorridoResult = await new Promise((res, rej) => {
                    connection.query(
                        'INSERT INTO recorridos (fecha, estado) VALUES (?, ?)',
                        [data.fecha, 'pendiente'],
                        (error, results) => {
                            if (error) rej(error);
                            res(results);
                        }
                    );
                });

                const recorridoId = recorridoResult.insertId;

                // Insertar los pedidos del recorrido
                for (const pedido of data.pedidos) {
                    await new Promise((res, rej) => {
                        connection.query(
                            'INSERT INTO recorrido_pedidos (recorrido_id, pedido_id, orden) VALUES (?, ?, ?)',
                            [recorridoId, pedido.pedido_id, pedido.orden],
                            (error) => {
                                if (error) rej(error);
                                res();
                            }
                        );
                    });
                }

                // Confirmar transacción
                await new Promise((res, rej) => {
                    connection.commit(err => {
                        if (err) rej(err);
                        res();
                    });
                });

                resolve(recorridoResult);
            } catch (error) {
                // Revertir transacción en caso de error
                await new Promise((res) => {
                    connection.rollback(() => res());
                });
                reject(error);
            }
        });
    }

    // Obtener todos los recorridos con sus pedidos
    static findAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    r.*,
                    COUNT(rp.id) as total_pedidos
                FROM recorridos r
                LEFT JOIN recorrido_pedidos rp ON r.id = r.id
                GROUP BY r.id
                ORDER BY r.fecha DESC, r.created_at DESC
            `;

            connection.query(query, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    // Obtener recorrido específico con todos sus pedidos
    static findById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    r.*,
                    rp.pedido_id,
                    rp.orden,
                    rp.estado as estado_pedido,
                    p.productos,
                    p.nombre_apellido,
                    c.calle_altura,
                    c.barrio,
                    c.ciudad
                FROM recorridos r
                LEFT JOIN recorrido_pedidos rp ON r.id = rp.recorrido_id
                LEFT JOIN pedidos p ON rp.pedido_id = p.id
                LEFT JOIN clientes c ON p.cliente_id = c.id
                WHERE r.id = ?
            `;

            connection.query(query, [id], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    // Actualizar estado del recorrido
    static updateEstado(id, estado) {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE recorridos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [estado, id],
                (error, results) => {
                    if (error) return reject(error);
                    // También actualizar los pedidos asociados
                    connection.query(
                        'UPDATE recorrido_pedidos SET estado = ? WHERE recorrido_id = ?',
                        [estado === 'completado' ? 'completado' : 'pendiente', id],
                        (error) => {
                            if (error) return reject(error);
                            resolve(results);
                        }
                    );
                }
            );
        });
    }

    static getPedidosAsignados() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT DISTINCT rp.pedido_id
                FROM recorrido_pedidos rp
                JOIN recorridos r ON r.id = rp.recorrido_id
                WHERE r.estado = 'pendiente'
            `;

            connection.query(query, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    // Actualizar estado de un pedido específico en el recorrido
    static updateEstadoPedido(recorridoId, pedidoId, estado) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE recorrido_pedidos 
                SET estado = ?, 
                    hora_entrega = ${estado === 'completado' ? 'CURRENT_TIMESTAMP' : 'NULL'}
                WHERE recorrido_id = ? AND pedido_id = ?
            `;

            connection.query(query, [estado, recorridoId, pedidoId], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    // Obtener recorridos por fecha
    static findByDate(fecha) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT r.*, 
                       COUNT(rp.id) as total_pedidos,
                       SUM(CASE WHEN rp.estado = 'completado' THEN 1 ELSE 0 END) as pedidos_completados
                FROM recorridos r
                LEFT JOIN recorrido_pedidos rp ON r.id = rp.recorrido_id
                WHERE r.fecha = ?
                GROUP BY r.id
            `;

            connection.query(query, [fecha], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    // Reordenar pedidos en un recorrido
    static reordenarPedidos(recorridoId, nuevosOrdenes) {
        return new Promise(async (resolve, reject) => {
            try {
                await new Promise((res, rej) => {
                    connection.beginTransaction(err => {
                        if (err) rej(err);
                        res();
                    });
                });

                for (const { pedido_id, orden } of nuevosOrdenes) {
                    await new Promise((res, rej) => {
                        connection.query(
                            'UPDATE recorrido_pedidos SET orden = ? WHERE recorrido_id = ? AND pedido_id = ?',
                            [orden, recorridoId, pedido_id],
                            (error) => {
                                if (error) rej(error);
                                res();
                            }
                        );
                    });
                }

                await new Promise((res, rej) => {
                    connection.commit(err => {
                        if (err) rej(err);
                        res();
                    });
                });

                resolve();
            } catch (error) {
                await new Promise((res) => {
                    connection.rollback(() => res());
                });
                reject(error);
            }
        });
    }
}

module.exports = Recorrido;
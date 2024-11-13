const Recorrido = require('../models/Recorrido');
const Pedido = require('../models/Pedido');

const recorridoController = {
    // Crear nuevo recorrido
    crearRecorrido: async (req, res) => {
        try {
            const { fecha, pedidos } = req.body;

            // Validar datos requeridos
            if (!fecha || !pedidos || !Array.isArray(pedidos) || pedidos.length === 0) {
                return res.status(400).json({
                    message: 'Datos inválidos para crear el recorrido'
                });
            }

            // Crear el recorrido
            const resultado = await Recorrido.create({
                fecha,
                pedidos
            });

            // Actualizar el estado de los pedidos a 'en_recorrido'
            for (const pedido of pedidos) {
                await Pedido.updateEstado(pedido.pedido_id, 'en_recorrido');
            }

            res.status(201).json({
                message: 'Recorrido creado exitosamente',
                recorridoId: resultado.insertId
            });
        } catch (error) {
            console.error('Error al crear recorrido:', error);
            res.status(500).json({
                message: 'Error al crear el recorrido',
                error: error.message
            });
        }
    },

    // Obtener todos los recorridos
    obtenerRecorridos: async (req, res) => {
        try {
            const recorridos = await Recorrido.findAll();
            res.status(200).json(recorridos);
        } catch (error) {
            console.error('Error al obtener recorridos:', error);
            res.status(500).json({
                message: 'Error al obtener los recorridos',
                error: error.message
            });
        }
    },

    // Obtener recorrido específico con sus pedidos
    obtenerRecorridoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const recorrido = await Recorrido.findById(id);

            if (!recorrido || recorrido.length === 0) {
                return res.status(404).json({
                    message: 'Recorrido no encontrado'
                });
            }

            // Formatear los datos del recorrido
            const recorridoFormateado = {
                id: recorrido[0].id,
                fecha: recorrido[0].fecha,
                estado: recorrido[0].estado,
                pedidos: recorrido.map(p => ({
                    pedido_id: p.pedido_id,
                    orden: p.orden,
                    estado: p.estado_pedido,
                    cliente: {
                        nombre_apellido: p.nombre_apellido,
                        calle_altura: p.calle_altura,
                        barrio: p.barrio,
                        ciudad: p.ciudad
                    },
                    productos: JSON.parse(p.productos)
                }))
            };

            res.status(200).json(recorridoFormateado);
        } catch (error) {
            console.error('Error al obtener recorrido:', error);
            res.status(500).json({
                message: 'Error al obtener el recorrido',
                error: error.message
            });
        }
    },

    // Actualizar estado del recorrido
    actualizarEstadoRecorrido: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (!['pendiente', 'en_progreso', 'completado'].includes(estado)) {
                return res.status(400).json({
                    message: 'Estado inválido'
                });
            }

            await Recorrido.updateEstado(id, estado);
            res.status(200).json({
                message: 'Estado del recorrido actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar estado del recorrido:', error);
            res.status(500).json({
                message: 'Error al actualizar el estado del recorrido',
                error: error.message
            });
        }
    },

    // Actualizar estado de un pedido en el recorrido
    actualizarEstadoPedido: async (req, res) => {
        try {
            const { recorridoId, pedidoId } = req.params;
            const { estado } = req.body;

            if (!['pendiente', 'completado'].includes(estado)) {
                return res.status(400).json({
                    message: 'Estado inválido para el pedido'
                });
            }

            await Recorrido.updateEstadoPedido(recorridoId, pedidoId, estado);

            // Si el pedido se completa, actualizar su estado en la tabla pedidos
            if (estado === 'completado') {
                await Pedido.updateEstado(pedidoId, 'realizado');
            }

            res.status(200).json({
                message: 'Estado del pedido actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar estado del pedido:', error);
            res.status(500).json({
                message: 'Error al actualizar el estado del pedido',
                error: error.message
            });
        }
    },

    // Obtener recorridos por fecha
    obtenerRecorridosPorFecha: async (req, res) => {
        try {
            const { fecha } = req.params;
            const recorridos = await Recorrido.findByDate(fecha);
            res.status(200).json(recorridos);
        } catch (error) {
            console.error('Error al obtener recorridos por fecha:', error);
            res.status(500).json({
                message: 'Error al obtener los recorridos por fecha',
                error: error.message
            });
        }
    },

    // Reordenar pedidos en un recorrido
    reordenarPedidos: async (req, res) => {
        try {
            const { recorridoId } = req.params;
            const { ordenes } = req.body;

            if (!Array.isArray(ordenes)) {
                return res.status(400).json({
                    message: 'El formato de los nuevos órdenes es inválido'
                });
            }

            await Recorrido.reordenarPedidos(recorridoId, ordenes);
            res.status(200).json({
                message: 'Pedidos reordenados exitosamente'
            });
        } catch (error) {
            console.error('Error al reordenar pedidos:', error);
            res.status(500).json({
                message: 'Error al reordenar los pedidos',
                error: error.message
            });
        }
    }
};

module.exports = recorridoController;

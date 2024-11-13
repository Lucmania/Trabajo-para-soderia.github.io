// Variables globales para manejar los pedidos y recorridos
let pedidosDisponibles = [];
let recorridoActual = [];
let barriosDisponibles = new Set();

// Función para cargar los pedidos disponibles para hoy
async function cargarPedidosDisponibles() {
    try {
        // Obtener pedidos, clientes y recorridos pendientes
        const [pedidosResponse, clientesResponse, recorridosResponse] = await Promise.all([
            fetch('http://localhost:5000/api/pedidos'),
            fetch('http://localhost:5000/api/clientes'),
            fetch('http://localhost:5000/api/recorridos/pedidos-asignados') // Nueva ruta que crearemos
        ]);

        if (!pedidosResponse.ok || !clientesResponse.ok || !recorridosResponse.ok) {
            throw new Error('Error al obtener datos del servidor');
        }

        const pedidos = await pedidosResponse.json();
        const clientes = await clientesResponse.json();
        const pedidosEnRecorridos = await recorridosResponse.json();

        // Crear un Set con los IDs de los pedidos que ya están en recorridos
        const pedidosAsignados = new Set(pedidosEnRecorridos.map(p => p.pedido_id));

        // Resetear los arrays y sets
        pedidosDisponibles = [];
        recorridoActual = [];
        barriosDisponibles.clear();

        // Filtrar pedidos pendientes para hoy que no estén en ningún recorrido
        pedidosDisponibles = pedidos.filter(pedido => {
            // Si el pedido ya está en un recorrido, excluirlo
            if (pedidosAsignados.has(pedido.id)) {
                return false;
            }

            const cliente = clientes.find(c => c.id === pedido.cliente_id);
            if (!cliente) return false;

            // Añadir información del cliente al pedido
            pedido.cliente = cliente;
            
            // Añadir barrio a la lista de barrios disponibles
            if (cliente.barrio) {
                barriosDisponibles.add(cliente.barrio);
            }

            return pedido.estado === 'pendiente' && (
                pedido.tipo_pedido === 'especifico' && esFechaHoy(pedido.fecha_solicitada) ||
                pedido.tipo_pedido === 'recurrente' && esPedidoRecurrenteParaHoy(pedido)
            );
        });

        actualizarSelectBarrios();
        mostrarPedidosDisponibles();
        mostrarRecorridoOrganizado();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los pedidos disponibles');
    }
}

// Función para verificar si una fecha es hoy
function esFechaHoy(fecha) {
    const hoy = new Date();
    const fechaPedido = new Date(fecha);
    return fechaPedido.toDateString() === hoy.toDateString();
}

// Función para verificar si un pedido recurrente corresponde a hoy
function esPedidoRecurrenteParaHoy(pedido) {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const hoy = diasSemana[new Date().getDay()];
    return pedido.dias_recurrentes.includes(hoy);
}

// Función para actualizar el selector de barrios
function actualizarSelectBarrios() {
    const filterBarrio = document.getElementById('filterBarrio');
    filterBarrio.innerHTML = '<option value="">Todos los Barrios</option>';
    
    [...barriosDisponibles].sort().forEach(barrio => {
        const option = document.createElement('option');
        option.value = barrio;
        option.textContent = barrio;
        filterBarrio.appendChild(option);
    });
}

// Función para mostrar los pedidos disponibles en la tabla
function mostrarPedidosDisponibles(barrioFiltro = '') {
    const tbody = document.getElementById('pedidosDisponibles');
    tbody.innerHTML = '';

    const pedidosFiltrados = barrioFiltro ? 
        pedidosDisponibles.filter(p => p.cliente.barrio === barrioFiltro) : 
        pedidosDisponibles;

    if (pedidosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay pedidos disponibles</td></tr>';
        return;
    }

    pedidosFiltrados.forEach(pedido => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pedido.cliente.nombre_apellido}</td>
            <td>${pedido.cliente.calle_altura}</td>
            <td>${pedido.cliente.barrio}</td>
            <td>${formatearProductos(pedido.productos)}</td>
            <td>${formatearHorario(pedido)}</td>
            <td>
                <button onclick="agregarAlRecorrido(${pedido.id})">Agregar al Recorrido</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para mostrar el recorrido organizado
function mostrarRecorridoOrganizado() {
    const tbody = document.getElementById('recorridoOrganizado');
    tbody.innerHTML = '';

    if (recorridoActual.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay pedidos en el recorrido actual</td></tr>';
        return;
    }

    recorridoActual.forEach((pedido, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${pedido.cliente.nombre_apellido}</td>
            <td>${pedido.cliente.calle_altura}</td>
            <td>${pedido.cliente.barrio}</td>
            <td>${formatearProductos(pedido.productos)}</td>
            <td>${formatearHorario(pedido)}</td>
            <td>
                <button onclick="moverArriba(${index})" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button onclick="moverAbajo(${index})" ${index === recorridoActual.length - 1 ? 'disabled' : ''}>↓</button>
                <button onclick="quitarDelRecorrido(${index})">Quitar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Funciones de utilidad
function formatearProductos(productos) {
    return productos.map(p => `${p.producto} x ${p.cantidad}`).join(', ');
}

function formatearHorario(pedido) {
    return `${pedido.hora_inicio.slice(0, 5)}${pedido.hora_fin ? ' - ' + pedido.hora_fin.slice(0, 5) : ''}`;
}

// Funciones para manipular el recorrido
function agregarAlRecorrido(pedidoId) {
    const pedido = pedidosDisponibles.find(p => p.id === pedidoId);
    if (pedido) {
        recorridoActual.push(pedido);
        pedidosDisponibles = pedidosDisponibles.filter(p => p.id !== pedidoId);
        mostrarPedidosDisponibles();
        mostrarRecorridoOrganizado();
    }
}

function quitarDelRecorrido(index) {
    const pedido = recorridoActual[index];
    if (pedido) {
        pedidosDisponibles.push(pedido);
        recorridoActual.splice(index, 1);
        mostrarPedidosDisponibles();
        mostrarRecorridoOrganizado();
    }
}

function moverArriba(index) {
    if (index > 0) {
        [recorridoActual[index], recorridoActual[index - 1]] = 
        [recorridoActual[index - 1], recorridoActual[index]];
        mostrarRecorridoOrganizado();
    }
}

function moverAbajo(index) {
    if (index < recorridoActual.length - 1) {
        [recorridoActual[index], recorridoActual[index + 1]] = 
        [recorridoActual[index + 1], recorridoActual[index]];
        mostrarRecorridoOrganizado();
    }
}

// Función para filtrar pedidos por barrio
function filtrarPedidos() {
    const barrioSeleccionado = document.getElementById('filterBarrio').value;
    mostrarPedidosDisponibles(barrioSeleccionado);
}

// Función para generar recorrido optimizado
function generarRecorrido() {
    if (recorridoActual.length === 0) {
        alert('No hay pedidos para optimizar');
        return;
    }

    // Agrupar pedidos por barrio
    const pedidosPorBarrio = {};
    recorridoActual.forEach(pedido => {
        const barrio = pedido.cliente.barrio;
        if (!pedidosPorBarrio[barrio]) {
            pedidosPorBarrio[barrio] = [];
        }
        pedidosPorBarrio[barrio].push(pedido);
    });

    // Ordenar cada grupo por horario y dirección
    Object.keys(pedidosPorBarrio).forEach(barrio => {
        pedidosPorBarrio[barrio].sort((a, b) => {
            // Primero ordenar por hora de inicio
            const horaA = a.hora_inicio;
            const horaB = b.hora_inicio;
            if (horaA !== horaB) {
                return horaA.localeCompare(horaB);
            }
            // Si tienen la misma hora, ordenar por dirección
            return a.cliente.calle_altura.localeCompare(b.cliente.calle_altura);
        });
    });

    // Crear el nuevo orden optimizado
    const recorridoOptimizado = [];
    
    // Ordenar los barrios por cantidad de pedidos (priorizar barrios con más pedidos)
    const barriosOrdenados = Object.keys(pedidosPorBarrio).sort((a, b) => {
        return pedidosPorBarrio[b].length - pedidosPorBarrio[a].length;
    });

    // Construir el recorrido final
    barriosOrdenados.forEach(barrio => {
        // Agregar un separador visual en la consola para debugging
        console.log(`--- Iniciando recorrido en barrio: ${barrio} ---`);
        
        pedidosPorBarrio[barrio].forEach(pedido => {
            recorridoOptimizado.push(pedido);
            // Log para debugging
            console.log(`Agregado pedido: ${pedido.cliente.nombre_apellido} - ${pedido.cliente.calle_altura} - ${pedido.hora_inicio}`);
        });
    });

    // Actualizar el recorrido actual con el optimizado
    recorridoActual = recorridoOptimizado;
    
    // Mostrar resumen de la optimización
    const resumen = barriosOrdenados.map(barrio => 
        `${barrio}: ${pedidosPorBarrio[barrio].length} pedidos`
    ).join('\n');
    
    alert(`Recorrido optimizado generado:\n\n${resumen}`);

    // Actualizar la vista
    mostrarRecorridoOrganizado();
}

// Función para guardar el recorrido
async function guardarRecorrido() {
    if (recorridoActual.length === 0) {
        alert('No hay pedidos en el recorrido actual');
        return;
    }

    try {
        const recorrido = {
            fecha: new Date().toISOString().split('T')[0],
            pedidos: recorridoActual.map((pedido, index) => ({
                pedido_id: pedido.id,
                orden: index + 1
            }))
        };

        const response = await fetch('http://localhost:5000/api/recorridos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recorrido)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el recorrido');
        }

        alert('Recorrido guardado exitosamente');
        recorridoActual = [];
        await cargarPedidosDisponibles();
        await cargarRecorridosGuardados();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el recorrido');
    }
}

// Añadir esta función para cargar los recorridos guardados
async function cargarRecorridosGuardados() {
    try {
        const response = await fetch('http://localhost:5000/api/recorridos');
        if (!response.ok) {
            throw new Error('Error al obtener recorridos guardados');
        }

        const recorridos = await response.json();
        mostrarRecorridosGuardados(recorridos);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los recorridos guardados');
    }
}

// Función para mostrar los recorridos guardados
function mostrarRecorridosGuardados(recorridos) {
    const tbody = document.getElementById('recorridosGuardados');
    tbody.innerHTML = '';

    if (!recorridos || recorridos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay recorridos guardados</td></tr>';
        return;
    }

    recorridos.forEach(recorrido => {
        const row = document.createElement('tr');
        const fecha = new Date(recorrido.fecha).toLocaleDateString();
        
        row.innerHTML = `
            <td>${fecha}</td>
            <td>${recorrido.total_pedidos || 0}</td>
            <td>${recorrido.estado}</td>
            <td>
                <button onclick="verDetalleRecorrido(${recorrido.id})">Ver Detalle</button>
                ${recorrido.estado === 'pendiente' ? 
                    `<button onclick="actualizarEstadoRecorrido(${recorrido.id}, 'completado')">Completar</button>` :
                    `<button onclick="actualizarEstadoRecorrido(${recorrido.id}, 'pendiente')">Reactivar</button>`
                }
                <button onclick="eliminarRecorrido(${recorrido.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para eliminar recorridos
async function eliminarRecorrido(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este recorrido? Los pedidos asociados se mantendrán en el sistema.')) {
        try {
            const response = await fetch(`http://localhost:5000/api/recorridos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el recorrido');
            }

            await cargarRecorridosGuardados();
            alert('Recorrido eliminado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el recorrido');
        }
    }
}

// Función para ver el detalle de un recorrido
async function verDetalleRecorrido(recorridoId) {
    try {
        const response = await fetch(`http://localhost:5000/api/recorridos/${recorridoId}`);
        if (!response.ok) {
            throw new Error('Error al obtener detalle del recorrido');
        }

        const detalle = await response.json();
        console.log('Detalle recibido:', detalle); // Para ver qué datos estamos recibiendo

        // Si no hay pedidos, mostrar mensaje
        if (!detalle || detalle.length === 0) {
            alert('No se encontraron detalles para este recorrido');
            return;
        }

        // Formatear los datos para mostrarlos
        const recorridoFormateado = {
            id: detalle[0].id,
            fecha: detalle[0].fecha,
            estado: detalle[0].estado,
            pedidos: detalle.map(item => ({
                orden: item.orden,
                cliente: {
                    nombre_apellido: item.nombre_apellido,
                    calle_altura: item.calle_altura,
                    barrio: item.barrio
                },
                productos: typeof item.productos === 'string' ? 
                    JSON.parse(item.productos) : item.productos,
                estado_pedido: item.estado_pedido
            }))
        };

        mostrarDetalleRecorrido(recorridoFormateado);
    } catch (error) {
        console.error('Error completo:', error);
        alert('Error al cargar el detalle del recorrido');
    }
}

// Función auxiliar para formatear productos
function formatearProductosDetalle(productos) {
    try {
        const prodsArray = typeof productos === 'string' ? JSON.parse(productos) : productos;
        if (!Array.isArray(prodsArray)) return '-';
        return prodsArray.map(p => `${p.producto} x ${p.cantidad}`).join(', ');
    } catch (error) {
        console.error('Error al formatear productos:', error);
        return '-';
    }
}

// Función para mostrar el detalle de un recorrido
function mostrarDetalleRecorrido(detalle) {
    const modalHTML = `
        <div class="modal" id="detalleRecorridoModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Detalle del Recorrido</h2>
                    <span class="close-button" onclick="cerrarModalDetalle()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="recorrido-info">
                        <div class="info-item">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${new Date(detalle.fecha).toLocaleDateString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado:</span>
                            <span class="info-value estado-${detalle.estado}">${detalle.estado}</span>
                        </div>
                    </div>
                    <div class="tabla-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Orden</th>
                                    <th>Cliente</th>
                                    <th>Dirección</th>
                                    <th>Barrio</th>
                                    <th>Productos</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${detalle.pedidos.map(pedido => `
                                    <tr>
                                        <td>${pedido.orden || '-'}</td>
                                        <td>${pedido.cliente.nombre_apellido || '-'}</td>
                                        <td>${pedido.cliente.calle_altura || '-'}</td>
                                        <td>${pedido.cliente.barrio || '-'}</td>
                                        <td>${formatearProductosDetalle(pedido.productos)}</td>
                                        <td class="estado-${pedido.estado_pedido || 'pendiente'}">
                                            ${pedido.estado_pedido || 'pendiente'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar estilos si no existen
    if (!document.getElementById('modalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'modalStyles';
        styles.textContent = `
            .modal {
                display: flex;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                align-items: center;
                justify-content: center;
            }

            .modal-content {
                background-color: #fff;
                width: 80%;
                max-width: 1000px;
                max-height: 90vh;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                position: relative;
                display: flex;
                flex-direction: column;
            }

            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #1a6778;
                color: white;
                border-radius: 8px 8px 0 0;
            }

            .modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
            }

            .modal-body {
                padding: 20px;
                overflow-y: auto;
            }

            .close-button {
                color: white;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                transition: color 0.3s ease;
            }

            .close-button:hover {
                color: #ddd;
            }

            .recorrido-info {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .info-label {
                font-weight: bold;
                color: #1a6778;
            }

            .tabla-container {
                overflow-x: auto;
            }

            .modal table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                background-color: white;
            }

            .modal th {
                background-color: #343a40;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: 500;
            }

            .modal td {
                padding: 12px;
                border-bottom: 1px solid #e0e0e0;
            }

            .modal tr:hover {
                background-color: #f5f5f5;
            }

            .estado-pendiente {
                color: #f39c12;
            }

            .estado-completado {
                color: #27ae60;
            }

            .estado-realizado {
                color: #27ae60;
            }

            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 10px;
                }

                .recorrido-info {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Eliminar modal anterior si existe
    const modalAnterior = document.getElementById('detalleRecorridoModal');
    if (modalAnterior) {
        modalAnterior.remove();
    }

    // Agregar el modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Función para cerrar el modal de detalle
function cerrarModalDetalle() {
    const modal = document.getElementById('detalleRecorridoModal');
    if (modal) {
        modal.remove();
    }
}

// Función para actualizar el estado de un recorrido
async function actualizarEstadoRecorrido(recorridoId, nuevoEstado) {
    try {
        const response = await fetch(`http://localhost:5000/api/recorridos/${recorridoId}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: nuevoEstado
            })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar estado del recorrido');
        }

        const mensaje = nuevoEstado === 'completado' ? 
            'Recorrido marcado como completado' : 
            'Recorrido reactivado exitosamente';
        
        alert(mensaje);
        await cargarRecorridosGuardados(); // Recargar la lista de recorridos
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el estado del recorrido');
    }
}

// Agregar evento para cerrar el modal al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const modal = document.getElementById('detalleRecorridoModal');
    if (modal && event.target === modal) {
        cerrarModalDetalle();
    }
});

// Cargar pedidos cuando se muestra la sección de recorridos
document.addEventListener('DOMContentLoaded', () => {
    const recorridosButton = document.querySelector('button[onclick="showSection(\'recorridos\')"]');
    if (recorridosButton) {
        recorridosButton.addEventListener('click', () => {
            cargarPedidosDisponibles();
            cargarRecorridosGuardados(); // Añadir esta línea
        });
    }
});

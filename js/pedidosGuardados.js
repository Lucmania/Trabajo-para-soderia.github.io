// Variables globales para almacenar los diferentes tipos de pedidos
let pedidosPendientes = [];
let pedidosRealizados = [];
let pedidosRecurrentesFuturos = [];
let todosLosPedidos = [];

// Función principal para cargar pedidos y clientes
async function cargarPedidos() {
    try {
        const [pedidosResponse, clientesResponse] = await Promise.all([
            fetch('http://localhost:5000/api/pedidos'),
            fetch('http://localhost:5000/api/clientes')
        ]);

        if (!pedidosResponse.ok || !clientesResponse.ok) {
            throw new Error('Error al obtener datos del servidor');
        }

        const pedidos = await pedidosResponse.json();
        const clientes = await clientesResponse.json();

        todosLosPedidos = pedidos;
        actualizarSelectClientes(clientes);
        organizarPedidos(pedidos, clientes);
    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
    }
}

// Función para actualizar el select de clientes en los filtros
function actualizarSelectClientes(clientes) {
    const filtroCliente = document.getElementById('filtroCliente');
    if (filtroCliente) {
        filtroCliente.innerHTML = '<option value="">Todos los clientes</option>';
        clientes.forEach(cliente => {
            filtroCliente.innerHTML += `
                <option value="${cliente.id}">${cliente.nombre_apellido}</option>
            `;
        });
    }
}

// Función para aplicar los filtros
function aplicarFiltros() {
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const clienteId = document.getElementById('filtroCliente').value;
    const estado = document.getElementById('filtroEstado').value;

    const pedidosFiltrados = todosLosPedidos.filter(pedido => {
        let cumpleFecha = true;
        let cumpleCliente = true;
        let cumpleEstado = true;

        // Filtro por fecha
        if (fechaDesde && fechaHasta) {
            const fechaPedido = new Date(pedido.fecha_solicitada);
            const fechaInicio = new Date(fechaDesde);
            const fechaFin = new Date(fechaHasta);
            fechaInicio.setHours(0, 0, 0, 0);
            fechaFin.setHours(23, 59, 59, 999);
            cumpleFecha = fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
        }

        // Filtro por cliente
        if (clienteId) {
            cumpleCliente = pedido.cliente_id.toString() === clienteId;
        }

        // Filtro por estado
        if (estado) {
            cumpleEstado = pedido.estado === estado;
        }

        return cumpleFecha && cumpleCliente && cumpleEstado;
    });

    organizarPedidos(pedidosFiltrados, todosLosPedidos.map(p => p.cliente));
}

// Función para limpiar los filtros
function limpiarFiltros() {
    document.getElementById('fechaDesde').value = '';
    document.getElementById('fechaHasta').value = '';
    document.getElementById('filtroCliente').value = '';
    document.getElementById('filtroEstado').value = '';
    organizarPedidos(todosLosPedidos, todosLosPedidos.map(p => p.cliente));
}

// Función para crear y actualizar los filtros
function crearFiltrosPedidos() {
    const filtrosContainer = document.createElement('div');
    filtrosContainer.className = 'filtros-pedidos';
    filtrosContainer.innerHTML = `
        <div class="filtro-grupo">
            <label>Fecha desde:
                <input type="date" id="fechaDesde">
            </label>
            <label>Fecha hasta:
                <input type="date" id="fechaHasta">
            </label>
            <label>Cliente:
                <select id="filtroCliente">
                    <option value="">Todos los clientes</option>
                </select>
            </label>
            <label>Estado:
                <select id="filtroEstado">
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="realizado">Realizado</option>
                </select>
            </label>
            <button onclick="aplicarFiltros()" class="btn-filtrar">Aplicar Filtros</button>
            <button onclick="limpiarFiltros()" class="btn-limpiar">Limpiar Filtros</button>
        </div>
    `;

    // Insertar los filtros al inicio de la sección de pedidos
    const seccionPedidos = document.getElementById('pedidosGuardados');
    seccionPedidos.insertBefore(filtrosContainer, seccionPedidos.firstChild);
}

// Función para organizar los pedidos en las diferentes categorías
function organizarPedidos(pedidos, clientes) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Reiniciar los arrays
    pedidosPendientes = [];
    pedidosRealizados = [];
    pedidosRecurrentesFuturos = [];

    pedidos.forEach(pedido => {
        const cliente = clientes.find(c => c.id === pedido.cliente_id);
        pedido.cliente = cliente; // Añadir la información del cliente al pedido

        if (pedido.tipo_pedido === 'especifico') {
            // Manejar pedidos específicos
            if (pedido.estado === 'pendiente') {
                pedidosPendientes.push(pedido);
            } else {
                pedidosRealizados.push(pedido);
            }
        } else if (pedido.tipo_pedido === 'recurrente') {
            // Manejar pedidos recurrentes
            const esParaHoy = esPedidoRecurrenteParaHoy(pedido);
            if (esParaHoy && pedido.estado === 'pendiente') {
                pedidosPendientes.push(pedido);
            } else if (pedido.estado === 'realizado') {
                pedidosRealizados.push(pedido);
            } else {
                pedidosRecurrentesFuturos.push(pedido);
            }
        }
    });

    // Actualizar todas las vistas
    actualizarVistasPedidos();
}

// Función para verificar si un pedido recurrente corresponde al día actual
function esPedidoRecurrenteParaHoy(pedido) {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const hoy = diasSemana[new Date().getDay()];
    return pedido.dias_recurrentes.includes(hoy);
}

// Función para actualizar todas las vistas de pedidos
function actualizarVistasPedidos() {
    actualizarTablaPedidosPendientes();
    actualizarTablaPedidosRealizados();
    actualizarTablaPedidosRecurrentesFuturos();
}

// Función para actualizar la tabla de pedidos pendientes
function actualizarTablaPedidosPendientes() {
    const tbody = document.getElementById('recorridosTableBodyHoy');
    tbody.innerHTML = '';

    if (pedidosPendientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay pedidos pendientes para hoy</td></tr>';
        return;
    }

    pedidosPendientes.forEach(pedido => {
        const row = crearFilaPedido(pedido, true);
        tbody.appendChild(row);
    });
}

// Función para actualizar la tabla de pedidos realizados (historial)
function actualizarTablaPedidosRealizados() {
    const tbody = document.getElementById('recorridosTableBodyRealizados');
    tbody.innerHTML = '';

    if (pedidosRealizados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay pedidos en el historial</td></tr>';
        return;
    }

    pedidosRealizados.forEach(pedido => {
        const row = crearFilaPedido(pedido, false);
        tbody.appendChild(row);
    });
}

// Función para actualizar la tabla de pedidos recurrentes futuros
function actualizarTablaPedidosRecurrentesFuturos() {
    const tbody = document.getElementById('recorridosTableBodyRecurrentesFuturos');
    tbody.innerHTML = '';

    if (pedidosRecurrentesFuturos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay pedidos recurrentes para días futuros</td></tr>';
        return;
    }

    pedidosRecurrentesFuturos.forEach(pedido => {
        const row = crearFilaPedido(pedido, true);
        tbody.appendChild(row);
    });
}

// Función para crear una fila de pedido
function crearFilaPedido(pedido, incluirBotonEstado) {
    const row = document.createElement('tr');

    // Formatear los detalles de productos
    const productosDetalle = pedido.productos && pedido.productos.length > 0
        ? pedido.productos.map(prod => `${prod.producto} x ${prod.cantidad}`).join(', ')
        : 'Sin productos';

    // Formatear la dirección completa
    let direccion = `${pedido.cliente.calle_altura}, ${pedido.cliente.ciudad}, ${pedido.cliente.barrio}`;
    if (pedido.cliente.piso) direccion += `, Piso: ${pedido.cliente.piso}`;
    if (pedido.cliente.departamento) direccion += `, Depto: ${pedido.cliente.departamento}`;

    // Formatear el horario
    const horario = pedido.hora_inicio && pedido.hora_fin
        ? `${pedido.hora_inicio.slice(0, 5)} - ${pedido.hora_fin.slice(0, 5)}`
        : 'No definido';

    // Formatear la fecha o días recurrentes
    const fechaODias = pedido.tipo_pedido === 'especifico'
        ? new Date(pedido.fecha_solicitada).toLocaleDateString()
        : pedido.dias_recurrentes.join(', ');

    row.innerHTML = `
        <td>${pedido.id || 'N/A'}</td>
        <td>${pedido.cliente.nombre_apellido || 'No definido'}</td>
        <td>${direccion}</td>
        <td>${fechaODias}</td>
        <td>${horario}</td>
        <td>${productosDetalle}</td>
        <td>
            ${incluirBotonEstado ?
            `<button class="button-estado" onclick="cambiarEstadoPedido(${pedido.id})">
                    Marcar como realizado
                </button>` :
            ''}
            <button class="button-eliminar" onclick="eliminarPedido(${pedido.id})">
                Eliminar
            </button>
        </td>
    `;

    return row;
}

// Función para cambiar el estado de un pedido
async function cambiarEstadoPedido(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/pedidos/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'realizado' })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el estado del pedido');
        }

        // Recargar los pedidos después de cambiar el estado
        await cargarPedidos();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el estado del pedido');
    }
}

// Función para eliminar un pedido
async function eliminarPedido(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
        try {
            // Primero verificar si el pedido está en algún recorrido
            const recorridoResponse = await fetch(`http://localhost:5000/api/recorridos/verificar-pedido/${id}`);
            const recorridoData = await recorridoResponse.json();

            let confirmarEliminacion = true;
            if (recorridoData.estaEnRecorrido) {
                confirmarEliminacion = confirm('Este pedido está incluido en uno o más recorridos. ¿Deseas eliminarlo de todos modos?');
            }

            if (confirmarEliminacion) {
                const response = await fetch(`http://localhost:5000/api/pedidos/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar el pedido');
                }

                await cargarPedidos(); // Recargar los pedidos
                alert('Pedido eliminado exitosamente');
            }
        } catch (error) {
            console.error('Error al eliminar el pedido:', error);
            alert('Error al eliminar el pedido');
        }
    }
}

// Evento para el botón de "Pedidos Guardados"
document.getElementById('btnPedidosGuardados').addEventListener('click', function () {
    cargarPedidos();
});

// Cargar pedidos inicialmente cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    crearFiltrosPedidos();
    cargarPedidos();
});

// Agregar estilos CSS para los filtros si no existen
if (!document.getElementById('filtrosStyles')) {
    const styles = document.createElement('style');
    styles.id = 'filtrosStyles';
    styles.textContent = `
        .filtros-pedidos {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .filtro-grupo {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }

        .filtro-grupo label {
            display: flex;
            flex-direction: column;
            gap: 5px;
            font-weight: 500;
        }

        .filtro-grupo input,
        .filtro-grupo select {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        .btn-filtrar,
        .btn-limpiar {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.3s ease;
        }

        .btn-filtrar {
            background-color: #1a6778;
            color: white;
        }

        .btn-filtrar:hover {
            background-color: #145666;
        }

        .btn-limpiar {
            background-color: #6c757d;
            color: white;
        }

        .btn-limpiar:hover {
            background-color: #5a6268;
        }

        @media (max-width: 768px) {
            .filtro-grupo {
                flex-direction: column;
                align-items: stretch;
            }
        }
    `;
    document.head.appendChild(styles);
}

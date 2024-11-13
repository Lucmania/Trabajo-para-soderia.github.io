// Inicializar clientes, pedidos y productos
let clientes = [];
let pedidos = [];
let productos = []; // Array para almacenar productos

// Función para cambiar entre secciones
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    // Cargar clientes en caso de que se muestre la sección de pedidos o deshabilitados
    if (sectionId === 'pedidos') {
        cargarClientesParaPedidos();
        cargarProductosParaPedidos(); // Cargar productos para la sección de pedidos
        renderRecorridos(); // Actualiza los recorridos al mostrar la sección de pedidos
    } else if (sectionId === 'deshabilitados') {
        cargarClientesDeshabilitados(); // Cargar deshabilitados al mostrar la sección
    } else if (sectionId === 'clientes') {
        cargarClientes(); // Cargar habilitados al mostrar la sección de clientes
    } else if (sectionId === 'productos') {
        cargarProductos(); // Cargar productos al mostrar la sección de productos
    }
}

// Función para mostrar/ocultar la barra lateral
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.querySelector('.content');
    const sidebarToggle = document.querySelector('.sidebar-toggle');

    if (sidebar.style.width === '0px') {
        sidebar.style.width = '250px';
        content.style.marginLeft = '260px';
        sidebarToggle.style.left = '260px';
    } else {
        sidebar.style.width = '0px';
        content.style.marginLeft = '0px';
        sidebarToggle.style.left = '0px';
    }
}

// Cargar clientes habilitados desde la base de datos
async function cargarClientes() {
    try {
        const response = await fetch('http://localhost:5000/api/clientes?estado=habilitado');
        if (!response.ok) throw new Error('Error al cargar clientes habilitados');
        clientes = await response.json();
        renderClientes();

        // Agregar campo de búsqueda
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'buscarCliente';
        searchInput.placeholder = 'Buscar por nombre...';
        searchInput.addEventListener('input', filtrarClientes);
        
        const clientesSection = document.getElementById('clientes');
        clientesSection.insertBefore(searchInput, document.getElementById('clientesList'));
    } catch (error) {
        console.error('Error al cargar clientes habilitados:', error);
    }
}

// Filtro de clientes
function filtrarClientes() {
    const searchTerm = document.getElementById('buscarCliente').value.toLowerCase();
    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nombre_apellido.toLowerCase().includes(searchTerm)
    );
    renderClientesFiltrados(clientesFiltrados);
}

function renderClientesFiltrados(clientesFiltrados) {
    const clientesList = document.getElementById('clientesList');
    clientesList.innerHTML = '';

    if (clientesFiltrados.length > 0) {
        let table = `
            <table>
                <thead>
                    <tr>
                        <th>Nombre y Apellido</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Dirección</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        clientesFiltrados.forEach((cliente, index) => {
            let direccion = `${cliente.calle_altura}, ${cliente.ciudad}, ${cliente.barrio}`;
            if (cliente.piso) direccion += `, Piso: ${cliente.piso}`;
            if (cliente.departamento) direccion += `, Departamento: ${cliente.departamento}`;

            table += `
                <tr>
                    <td>${cliente.nombre_apellido}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.email}</td>
                    <td>${direccion}</td>
                    <td>
                        <button onclick="editCliente(${index})">Editar</button>
                        <button onclick="disableCliente(${index})">Deshabilitar</button>
                    </td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        clientesList.innerHTML = table;
    } else {
        clientesList.innerHTML = '<p>No se encontraron clientes</p>';
    }
}

// Cargar clientes deshabilitados
async function cargarClientesDeshabilitados() {
    try {
        const response = await fetch('http://localhost:5000/api/clientes?estado=deshabilitado');
        if (!response.ok) throw new Error('Error al cargar clientes deshabilitados');
        const deshabilitados = await response.json();
        renderDeshabilitados(deshabilitados); // Renderizar la lista de clientes deshabilitados
    } catch (error) {
        console.error('Error al cargar clientes deshabilitados:', error);
    }
}

// Cargar clientes en el selector de la sección de pedidos
async function cargarClientesParaPedidos() {
    try {
        const response = await fetch('http://localhost:5000/api/clientes');
        if (!response.ok) throw new Error('Error al cargar clientes');
        clientes = await response.json();
        const clienteSelect = document.getElementById('clienteSelect');
        clienteSelect.innerHTML = ''; // Limpiar el select
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id; // Asumiendo que tienes un campo 'id' en tus datos
            option.textContent = cliente.nombre_apellido; // Cambia a nombre_apellido
            clienteSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

// Cargar productos desde la base de datos
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:5000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        productos = await response.json();
        renderProductos(); // Renderizar la lista de productos
        renderProductosParaPedidos(); // Llenar la sección de pedidos con productos
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Cargar productos para pedidos
async function cargarProductosParaPedidos() {
    try {
        const response = await fetch('http://localhost:5000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos para pedidos');
        productos = await response.json();
        renderProductosParaPedidos(); // Llenar la sección de pedidos con productos
    } catch (error) {
        console.error('Error al cargar productos para pedidos:', error);
    }
}

// Función para mostrar/ocultar el input de cantidad
function toggleCantidadInput(checkbox) {
    const cantidadInput = document.getElementById(`cantidad-${checkbox.value}`);
    cantidadInput.style.display = checkbox.checked ? 'inline-block' : 'none';
    cantidadInput.required = checkbox.checked;
}

// Guardar cliente
document.getElementById('clienteForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nombreApellido = document.getElementById('nombreApellido').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const ciudad = document.getElementById('ciudad').value;
    const barrio = document.getElementById('barrio').value; // Agregar esta línea
    const calleAltura = document.getElementById('calleAltura').value;
    const piso = document.getElementById('piso').value;
    const departamento = document.getElementById('departamento').value;

    const clienteIndex = document.getElementById('clienteIndex').value;

    // Verifica si el cliente ya existe por teléfono
    if (!clienteIndex && clientes.some(cliente => cliente.telefono === telefono)) {
        alert("El número telefónico ya está registrado.");
        return;
    }

    const cliente = {
        nombre_apellido: nombreApellido,
        telefono,
        email,
        ciudad,
        barrio, // Agregar esta línea
        calle_altura: calleAltura,
        piso,
        departamento
    };

    if (clienteIndex) {
        // Actualizar cliente existente
        const clienteId = clientes[clienteIndex].id; // Obtener el ID del cliente
        await fetch(`http://localhost:5000/api/clientes/${clienteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cliente),
        });
    } else {
        // Agregar nuevo cliente
        await fetch('http://localhost:5000/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cliente),
        });
    }

    await cargarClientes(); // Recargar clientes después de guardar
    resetClienteForm();
});

// Función para renderizar clientes habilitados en formato de tabla
function renderClientes() {
    const clientesList = document.getElementById('clientesList');
    clientesList.innerHTML = '';

    if (clientes.length > 0) {
        let table = `
            <table>
                <thead>
                    <tr>
                        <th>Nombre y Apellido</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Dirección</th>
                        <th>Barrio</th> <!-- Agregar esta columna -->
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        clientes.forEach((cliente, index) => {
            let direccion = `${cliente.calle_altura}, ${cliente.ciudad}`;
            if (cliente.piso) direccion += `, Piso: ${cliente.piso}`;
            if (cliente.departamento) direccion += `, Departamento: ${cliente.departamento}`;

            table += `
                <tr>
                    <td>${cliente.nombre_apellido}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.email}</td>
                    <td>${direccion}</td>
                    <td>${cliente.barrio}</td> <!-- Agregar esta columna -->
                    <td>
                        <button onclick="editCliente(${index})">Editar</button>
                        <button onclick="disableCliente(${index})">Deshabilitar</button>
                    </td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        clientesList.innerHTML = table;
    }
}

// Función para renderizar clientes deshabilitados en formato de tabla
function renderDeshabilitados(deshabilitados) {
    const deshabilitadosList = document.getElementById('deshabilitadosList');
    deshabilitadosList.innerHTML = ''; // Limpiar la lista antes de renderizar

    if (deshabilitados.length > 0) {
        let table = `
            <table>
                <thead>
                    <tr>
                        <th>Nombre y Apellido</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Dirección</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        deshabilitados.forEach(cliente => {
            let direccion = `${cliente.calle_altura}, ${cliente.ciudad}`;
            if (cliente.piso) direccion += `, Piso: ${cliente.piso}`;
            if (cliente.departamento) direccion += `, Departamento: ${cliente.departamento}`;

            table += `
                <tr>
                    <td>${cliente.nombre_apellido}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.email}</td>
                    <td>${direccion}</td>
                    <td>
                        <button onclick="enableCliente(${cliente.id})">Habilitar</button>
                        <button onclick="deleteCliente(${cliente.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        deshabilitadosList.innerHTML = table; // Añadir la tabla al HTML
    }
}

// Editar cliente
function editCliente(index) {
    const cliente = clientes[index];
    document.getElementById('nombreApellido').value = cliente.nombre_apellido;
    document.getElementById('telefono').value = cliente.telefono;
    document.getElementById('email').value = cliente.email;
    document.getElementById('ciudad').value = cliente.ciudad;
    document.getElementById('barrio').value = cliente.barrio; // Agregar esta línea
    document.getElementById('calleAltura').value = cliente.calle_altura;
    document.getElementById('piso').value = cliente.piso;
    document.getElementById('departamento').value = cliente.departamento;
    document.getElementById('clienteIndex').value = index;
}

// Deshabilitar cliente
async function disableCliente(index) {
    if (confirm('¿Estás seguro de que deseas deshabilitar este cliente? Los pedidos y recorridos del historial se mantendrán.')) {
        const clienteId = clientes[index].id;
        try {
            await fetch(`http://localhost:5000/api/clientes/${clienteId}/habilitar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'deshabilitado' }),
            });
            await cargarClientes();
            await cargarClientesDeshabilitados();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al deshabilitar el cliente');
        }
    }
}

// Habilitar cliente
async function enableCliente(clienteId) {
    await fetch(`http://localhost:5000/api/clientes/${clienteId}/habilitar`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'habilitado' }), // Habilitar
    });
    await cargarClientes(); // Recargar lista de habilitados
    await cargarClientesDeshabilitados(); // Recargar lista de deshabilitados
}

// Eliminar cliente
async function deleteCliente(clienteId) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente? Los pedidos y recorridos del historial se mantendrán.')) {
        try {
            const response = await fetch(`http://localhost:5000/api/clientes/${clienteId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el cliente');
            }

            await cargarClientes();
            await cargarClientesDeshabilitados();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el cliente');
        }
    }
}

// Resetear formulario de cliente
function resetClienteForm() {
    document.getElementById('clienteForm').reset();
    document.getElementById('clienteIndex').value = '';
}

// Guardar producto
document.getElementById('productoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nombreProducto = document.getElementById('nombreProducto').value;
    const precioProducto = parseFloat(document.getElementById('precioProducto').value); // Convertir a número
    const descripcionProducto = document.getElementById('descripcionProducto').value;

    const productoIndex = document.getElementById('productoIndex').value; // Añadir un campo oculto para el índice o ID

    const producto = { nombre: nombreProducto, precio: precioProducto, descripcion: descripcionProducto };

    if (productoIndex) {
        // Actualizar producto existente
        await fetch(`http://localhost:5000/api/productos/${productos[productoIndex].id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto),
        });
    } else {
        // Agregar nuevo producto
        await fetch('http://localhost:5000/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto),
        });
    }

    await cargarProductos(); // Recargar productos después de guardar
    this.reset(); // Limpiar el formulario
});

// Cargar productos desde la base de datos
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:5000/api/productos');
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        productos = await response.json();
        renderProductos(); // Renderizar la lista de productos
        renderProductosParaPedidos(); // Llenar la sección de pedidos con productos
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Renderizar productos en formato de tabla
function renderProductos() {
    const productosList = document.getElementById('productosList');
    productosList.innerHTML = '';

    if (productos.length > 0) {
        let table = `
            <table>
                <thead>
                    <tr>
                        <th>Nombre del Producto</th>
                        <th>Precio</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        productos.forEach((producto) => {
            table += `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                    <td>${producto.descripcion || 'N/A'}</td>
                    <td>
                        <button onclick="editProducto(${producto.id})">Editar</button>
                        <button onclick="deleteProducto(${producto.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        productosList.innerHTML = table; // Añadir la tabla al HTML
    }
}

// Renderizar productos para la sección de pedidos
function renderProductosParaPedidos() {
    const productosPedidoDiv = document.getElementById('productosPedido');
    productosPedidoDiv.innerHTML = ''; // Limpiar el contenido antes de renderizar

    if (productos.length > 0) {
        productos.forEach((producto) => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = producto.id; // Usar el ID del producto
            checkbox.id = `producto-${producto.id}`;
            checkbox.onclick = () => {
                const cantidadInput = document.getElementById(`cantidad-${producto.id}`);
                if (checkbox.checked) {
                    cantidadInput.style.display = 'inline-block';
                    cantidadInput.required = true;
                } else {
                    cantidadInput.style.display = 'none';
                    cantidadInput.required = false;
                    cantidadInput.value = ''; // Reset cantidad
                }
            };

            const label = document.createElement('label');
            label.htmlFor = `producto-${producto.id}`;
            label.textContent = `${producto.nombre} - $${parseFloat(producto.precio).toFixed(2)}`;

            const cantidadInput = document.createElement('input');
            cantidadInput.type = 'number';
            cantidadInput.id = `cantidad-${producto.id}`;
            cantidadInput.style.display = 'none'; // Ocultar al principio
            cantidadInput.min = '1';
            cantidadInput.placeholder = 'Cantidad';

            productosPedidoDiv.appendChild(checkbox);
            productosPedidoDiv.appendChild(label);
            productosPedidoDiv.appendChild(cantidadInput);
            productosPedidoDiv.appendChild(document.createElement('br'));
        });
    }
}

// Editar producto
function editProducto(productoId) {
    const producto = productos.find(p => p.id === productoId);
    document.getElementById('nombreProducto').value = producto.nombre;
    document.getElementById('precioProducto').value = producto.precio;
    document.getElementById('descripcionProducto').value = producto.descripcion;
    document.getElementById('productoIndex').value = productos.indexOf(producto);
}

// Eliminar producto
async function deleteProducto(productoId) {
    await fetch(`http://localhost:5000/api/productos/${productoId}`, {
        method: 'DELETE',
    });
    await cargarProductos(); // Recargar productos después de eliminar
}

// Funciones para manejar el formulario de pedidos
function toggleCantidadProducto(checkbox) {
    const cantidadInput = document.getElementById('cantidad' + capitalizeFirstLetter(checkbox.value));
    if (checkbox.checked) {
        cantidadInput.style.display = 'inline-block';
        cantidadInput.required = true;
    } else {
        cantidadInput.style.display = 'none';
        cantidadInput.required = false;
        cantidadInput.value = ''; // Reset cantidad
    }
}

function toggleFechaDias() {
    const tipoPedido = document.getElementById('tipoPedido').value;
    const fechaEspecifica = document.getElementById('fechaEspecifica');
    const diasRecurrentes = document.getElementById('diasRecurrentes');

    if (tipoPedido === 'especifico') {
        fechaEspecifica.style.display = 'block';
        diasRecurrentes.style.display = 'none';
    } else if (tipoPedido === 'recurrente') {
        fechaEspecifica.style.display = 'none';
        diasRecurrentes.style.display = 'block';
    } else {
        fechaEspecifica.style.display = 'none';
        diasRecurrentes.style.display = 'none';
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Guardar pedido
document.getElementById('pedidoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const clienteIndex = document.getElementById('clienteSelect').value; // Obtener el ID del cliente seleccionado
    if (clienteIndex === "") {
        alert("Por favor, seleccione un cliente.");
        return;
    }

    const tipoPedido = document.getElementById('tipoPedido').value;

    const productosSeleccionados = [];
    productos.forEach(producto => {
        const checkbox = document.querySelector(`input[value="${producto.id}"]`);
        if (checkbox && checkbox.checked) {
            const cantidad = document.getElementById(`cantidad-${producto.id}`).value; // Cambié a `cantidad-${producto.id}`
            productosSeleccionados.push({ producto: producto.nombre, cantidad });
        }
    });

    if (productosSeleccionados.length === 0) {
        alert("Por favor, seleccione al menos un producto.");
        return;
    }

    let pedido = {
        cliente_id: clienteIndex,
        tipo_pedido: tipoPedido,
        productos: productosSeleccionados
    };

    if (tipoPedido === 'especifico') {
        const fechaSolicitada = document.getElementById('fechaSolicitada').value;
        const horaInicio = document.getElementById('horaInicio').value;
        const horaFin = document.getElementById('horaFin').value;

        if (!fechaSolicitada || !horaInicio) {
            alert("Por favor, complete la fecha y hora para el pedido específico.");
            return;
        }

        pedido.fecha_solicitada = fechaSolicitada;
        pedido.hora_inicio = horaInicio;
        pedido.hora_fin = horaFin || '';
    } else if (tipoPedido === 'recurrente') {
        const diasRecurrentes = Array.from(document.querySelectorAll('#diasRecurrentes input:checked')).map(cb => cb.value);
        const horaInicioRecurrente = document.getElementById('horaInicioRecurrente').value;
        const horaFinRecurrente = document.getElementById('horaFinRecurrente').value;

        if (diasRecurrentes.length === 0 || !horaInicioRecurrente) {
            alert("Por favor, complete los días y horarios para el pedido recurrente.");
            return;
        }

        pedido.dias_recurrentes = diasRecurrentes; // Asegúrate de que esta variable esté correctamente establecida
        pedido.hora_inicio = horaInicioRecurrente;
        pedido.hora_fin = horaFinRecurrente || '';
    } else {
        alert("Por favor, seleccione un tipo de pedido.");
        return;
    }

    // Guardar el pedido en la base de datos
    await fetch('http://localhost:5000/api/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedido),
    });

    resetPedidoForm();
    renderRecorridos(); // Actualizar la tabla de recorridos al guardar un pedido
});

// Función para renderizar recorridos (pedidos) en la tabla de recorridos
function renderRecorridos() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${year}-${month}-${day}`;

    const recorridosTableBodyHoy = document.getElementById('recorridosTableBodyHoy');
    recorridosTableBodyHoy.innerHTML = '';

    pedidos.forEach(pedido => {
        // Verificar si el pedido es específico y es para hoy
        if (pedido.tipo_pedido === 'especifico' && pedido.fecha_solicitada === formattedToday) {
            let row = document.createElement('tr');
            const productosText = pedido.productos.map(p => `${p.cantidad} ${p.producto}`).join(', ');
            let direccion = `${pedido.cliente.calle_altura}, ${pedido.cliente.ciudad}`;
            if (pedido.cliente.piso) direccion += `, Piso: ${pedido.cliente.piso}`;
            if (pedido.cliente.departamento) direccion += `, Departamento: ${pedido.cliente.departamento}`;

            let horarioEntrega = `${pedido.fecha_solicitada} ${pedido.hora_inicio}`;
            if (pedido.hora_fin) horarioEntrega += ` - ${pedido.hora_fin}`;

            row.innerHTML = `<td>${pedido.cliente.nombre_apellido}</td><td>${productosText}</td><td>${direccion}</td><td>${horarioEntrega}</td>`;
            recorridosTableBodyHoy.appendChild(row);
        }
    });
}

function resetPedidoForm() {
    document.getElementById('pedidoForm').reset();
    document.getElementById('pedidoIndex').value = '';
    document.getElementById('fechaEspecifica').style.display = 'none';
    document.getElementById('diasRecurrentes').style.display = 'none';
    document.querySelectorAll('.cantidad-producto').forEach(input => {
        input.style.display = 'none';
        input.previousElementSibling.checked = false;
    });
}

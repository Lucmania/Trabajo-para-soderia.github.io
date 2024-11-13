// AGREGA CLASE boxCardAnimated AL HACER SCROLL PARA ANIMAR COMPONENTE CARD 
window.onscroll = function() {
    let scrollPosY = window.pageYOffset || document.body.scrollTop;

    let subir = document.querySelector('#subir');
    if (scrollPosY >= 400) {
        if (subir) {
            subir.classList.add("irArriba");
        }
    } else {
        if (subir) {
            subir.classList.remove("irArriba");
        }
    }

    let cardAnimated = document.getElementById('cardAnimada');
    if (cardAnimated) {
        if (scrollPosY >= 910) {
            cardAnimated.classList.add("boxCardAnimated");
        } else {
            cardAnimated.classList.remove("boxCardAnimated");
        }
    }
};

// AGREGA CLASE current AL HACER SCROLL 
let mainNavLinks = document.querySelectorAll("nav div ul li a");

window.addEventListener("scroll", event => {
    event.preventDefault();

    let fromTop = window.scrollY;

    mainNavLinks.forEach(link => {
        let section = document.querySelector(link.hash);
        if (section) {
            if (
                section.offsetTop <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop
            ) {
                link.classList.add("current");
            } else {
                link.classList.remove("current");
            }
        }
    });
});

// DESPLAZAMIENTO SMOOTH SCROLL
window.onload = function() {
    const easeInCubic = function(t) { return t * t * t }
    const scrollElems = document.getElementsByClassName('scroll');

    const scrollToElem = (start, stamp, duration, scrollEndElemTop, startScrollOffset) => {
        const runtime = stamp - start;
        let progress = runtime / duration;
        const ease = easeInCubic(progress);

        progress = Math.min(progress, 1);

        const newScrollOffset = startScrollOffset + (scrollEndElemTop * ease);
        window.scroll(0, startScrollOffset + (scrollEndElemTop * ease));

        if (runtime < duration) {
            requestAnimationFrame((timestamp) => {
                const stamp = new Date().getTime();
                scrollToElem(start, stamp, duration, scrollEndElemTop, startScrollOffset);
            })
        }
    }

    for (let i = 0; i < scrollElems.length; i++) {
        const elem = scrollElems[i];

        elem.addEventListener('click', function(e) {
            e.preventDefault();
            const scrollElemId = e.target.href.split('#')[1];
            const scrollEndElem = document.getElementById(scrollElemId);

            if (scrollEndElem) {
                const anim = requestAnimationFrame(() => {
                    const stamp = new Date().getTime();
                    const duration = 1200;
                    const start = stamp;

                    const startScrollOffset = window.pageYOffset;

                    const scrollEndElemTop = scrollEndElem.getBoundingClientRect().top;

                    scrollToElem(start, stamp, duration, scrollEndElemTop, startScrollOffset);
                });
            }
        })
    }
}

document.getElementById("submitBtn").addEventListener("click", validarFormulario);

function validarFormulario() {
    let nombre = document.getElementById("inputName").value;
    let apellido = document.getElementById("inputLastName").value;
    let email = document.getElementById("inputEmail").value;
    let asunto = document.getElementById("inputSubject").value;
    let mensaje = document.getElementById("message").value;

    let nombreValido = /^[a-zA-Z\s]{1,40}$/.test(nombre);
    let apellidoValido = /^[a-zA-Z\s]{1,40}$/.test(apellido);
    let emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    let asuntoValido = /^[a-zA-Z0-9\/s]{1,40}$/.test(asunto);
    let mensajeValido = /^[a-zA-Z0-9\/s]{1,255}$/.test(mensaje);

    if (!nombreValido) {
        mostrarError("Por favor, ingresa un nombre válido (de máximo 40 caracteres).");
    } else if (!apellidoValido) {
        mostrarError("Por favor, ingresa un apellido válido (de máximo 40 caracteres).");
    } else if (!emailValido) {
        mostrarError("Por favor, ingresa un correo electrónico válido.");
    } else if (!asuntoValido) {
        mostrarError("Por favor, llene el campo de asunto (máximo 40 caracteres).");
    } else if (!mensajeValido) {
        mostrarError("Por favor, llene el campo de mensaje (máximo 255 caracteres).");
    } else {
        // Construir el cuerpo del correo
        const cuerpoCorreo = `
Nombre: ${nombre} ${apellido}
Email: ${email}

Mensaje:
${mensaje}`;

        // Crear y abrir el enlace mailto
        const mailtoLink = `mailto:rockvive27@gmail.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpoCorreo)}`;
        window.location.href = mailtoLink;

        mostrarExito("Mensaje enviado con éxito!");
        document.getElementById("miForm").reset();
    }
}

function mostrarError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje
    });
}

function mostrarExito(mensaje) {
    Swal.fire({
        icon: 'success',
        title: mensaje,
        showConfirmButton: false,
        timer: 3000
    });
}

// --------- Lógica de Gestión de Productos --------- //
let productos = []; // Array para almacenar productos

// Guardar producto
document.getElementById('productoForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const nombreProducto = document.getElementById('nombreProducto').value;
    const precioProducto = document.getElementById('precioProducto').value;
    const descripcionProducto = document.getElementById('descripcionProducto').value;

    const producto = { nombre: nombreProducto, precio: precioProducto, descripcion: descripcionProducto };

    productos.push(producto); // Agregar el producto a la lista

    renderProductos(); // Renderizar la lista de productos
    this.reset(); // Limpiar el formulario
});

// Función para renderizar productos en la lista
function renderProductos() {
    const productosList = document.getElementById('productosList');
    productosList.innerHTML = ''; // Limpiar la lista antes de renderizar

    productos.forEach((producto, index) => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.innerHTML = `
            <p><strong>Nombre:</strong> ${producto.nombre}</p>
            <p><strong>Precio:</strong> $${producto.precio}</p>
            <p><strong>Descripción:</strong> ${producto.descripcion}</p>
            <button onclick="editProducto(${index})">Editar</button>
            <button onclick="deleteProducto(${index})">Eliminar</button>
        `;
        productosList.appendChild(productoDiv);
    });
}

// Función para editar un producto
function editProducto(index) {
    const producto = productos[index];
    document.getElementById('nombreProducto').value = producto.nombre;
    document.getElementById('precioProducto').value = producto.precio;
    document.getElementById('descripcionProducto').value = producto.descripcion;

    // Podrías agregar un campo oculto para saber el índice del producto que se está editando
}

// Función para eliminar un producto
function deleteProducto(index) {
    productos.splice(index, 1); // Eliminar el producto del array
    renderProductos(); // Volver a renderizar la lista de productos
}

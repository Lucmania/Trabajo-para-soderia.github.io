// Manejar la animación de los labels para los inputs
$(document).ready(function() {
    $(".contenedor-formularios").find("input, textarea").on("keyup blur focus", function (e) {
        var $this = $(this),
            label = $this.prev("label");

        if (e.type === "keyup") {
            if ($this.val() === "") {
                label.removeClass("active highlight"); // Si el campo está vacío, remueve clases
            } else {
                label.addClass("active highlight"); // Si el campo tiene texto, activa el label
            }
        } else if (e.type === "blur") {
            if ($this.val() === "") {
                label.removeClass("active highlight");
            } else {
                label.removeClass("highlight");
            }
        } else if (e.type === "focus") {
            if ($this.val() === "") {
                label.removeClass("highlight");
            } else {
                label.addClass("highlight");
            }
        }
    });
});

// Mostrar/ocultar la contraseña con el ícono de ojo
document.getElementById('togglePassword').addEventListener('click', function () {
    var passwordField = document.getElementById('password');
    var icon = this.querySelector('i');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// Manejar el inicio de sesión enviando los datos al servidor
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita que se recargue la página

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Enviar los datos al servidor para iniciar sesión
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }) // Enviar como JSON
        });

        const data = await response.json();

        if (response.ok) {
            // Si el inicio de sesión es exitoso, redirigir al dashboard
            alert('Inicio de sesión exitoso');
            window.location.href = "../dashboard/index.html";
        } else {
            // Mostrar el mensaje de error devuelto por el servidor
            alert(data.message || 'Error en el inicio de sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al procesar la solicitud.');
    }
});

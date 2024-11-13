// Inicializar EmailJS
// Reemplazar 'TU_PUBLIC_KEY' con tu clave pública de EmailJS
emailjs.init('TU_PUBLIC_KEY');

document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Mostrar estado de carga
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<span>Enviando...</span>';
    submitBtn.disabled = true;

    // Preparar los parámetros para el email
    const templateParams = {
        from_name: `${this.nombre.value} ${this.apellido.value}`,
        from_email: this.email.value,
        subject: this.asunto.value,
        message: this.mensaje.value,
        to_email: 'rockvive27@gmail.com'
    };

    // Enviar el email
    // Reemplazar 'TU_SERVICE_ID' y 'TU_TEMPLATE_ID' con tus IDs de EmailJS
    emailjs.send('TU_SERVICE_ID', 'TU_TEMPLATE_ID', templateParams)
        .then(function() {
            // Mostrar mensaje de éxito
            const successMessage = document.createElement('div');
            successMessage.className = 'form-message success';
            successMessage.textContent = '¡Mensaje enviado con éxito!';
            document.getElementById('contactForm').appendChild(successMessage);
            
            // Limpiar formulario
            document.getElementById('contactForm').reset();
        })
        .catch(function(error) {
            // Mostrar mensaje de error
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.';
            document.getElementById('contactForm').appendChild(errorMessage);
        })
        .finally(function() {
            // Restaurar botón
            submitBtn.innerHTML = '<span>Enviar mensaje</span>';
            submitBtn.disabled = false;
        });
});
document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // --- SIMULACIÓN DEL DOMINIO DE RASA ---
    // En un bot real, esto estaría en domain.yml
    const botResponses = {
        greet: "¡Hola! ¿En qué puedo ayudarte hoy?",
        goodbye: "¡Hasta luego! Que tengas un buen día.",
        default: "Lo siento, no entendí eso. ¿Puedes decirlo de otra manera?"
    };

    // --- FUNCIÓN PARA MOSTRAR MENSAJES EN EL CHAT ---
    function displayMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll al final
    }

    // --- FUNCIÓN PRINCIPAL QUE SIMULA EL NLU Y EL DIÁLOGO ---
    function handleUserMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        // Mostrar el mensaje del usuario
        displayMessage('user', userText);
        userInput.value = '';

        // Simular "pensamiento" del bot
        setTimeout(() => {
            // --- SIMULACIÓN DEL NLU DE RASA ---
            // Identificar la intención del usuario (muy simplificado)
            let intent = 'default'; // Intención por defecto si no se reconoce nada
            const lowerCaseText = userText.toLowerCase();

            if (lowerCaseText.includes('hola') || lowerCaseText.includes('buenos días') || lowerCaseText.includes('hey')) {
                intent = 'greet';
            } else if (lowerCaseText.includes('adiós') || lowerCaseText.includes('hasta luego') || lowerCaseText.includes('chao')) {
                intent = 'goodbye';
            }

            // --- SIMULACIÓN DE LA POLÍTICA DE DIÁLOGO ---
            // Seleccionar la respuesta del bot basada en la intención
            const botResponse = botResponses[intent] || botResponses.default;

            // Mostrar la respuesta del bot
            displayMessage('bot', botResponse);
        }, 500); // 500ms de retraso para simular procesamiento
    }

    // --- EVENT LISTENERS ---
    sendButton.addEventListener('click', handleUserMessage);

    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleUserMessage();
        }
    });

    // Mensaje de bienvenida inicial del bot
    displayMessage('bot', botResponses.greet);
});
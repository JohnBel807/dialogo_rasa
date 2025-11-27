document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // --- ESTADO DE LA CONVERSACIÓN (SIMULACIÓN DE SLOTS) ---
    let conversationState = {
        name: null,
        favorite_color: null,
        current_form_step: 'idle' // idle, asking_name, asking_color, complete
    };

    // --- RESPUESTAS DEL BOT ---
    const botResponses = {
        greet: "¡Hola! Soy un bot de demostración. Para empezar, ¿podrías decirme tu nombre?",
        ask_name: "¿Cuál es tu nombre?",
        ask_color: (name) => `Gracias, ${name}. Ahora, ¿cuál es tu color favorito?`,
        form_complete: (name, color) => `¡Perfecto! He guardado tu nombre como ${name} y tu color favorito como ${color}. ¡Esa es una gran elección!`,
        fallback: "Lo siento, no entendí. ¿Podrías repetirlo?",
    };

    // --- FUNCIÓN PARA MOSTRAR MENSAJES Y BOTONES ---
    function displayMessage(sender, text, quickReplies = []) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        const textElement = document.createElement('p');
        textElement.textContent = text;
        messageElement.appendChild(textElement);

        if (quickReplies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.classList.add('quick-replies');
            quickReplies.forEach(reply => {
                const button = document.createElement('button');
                button.classList.add('quick-reply-button');
                button.textContent = reply;
                button.addEventListener('click', () => {
                    // Simular que el usuario hizo clic en el botón
                    userInput.value = reply;
                    handleUserMessage();
                });
                repliesContainer.appendChild(button);
            });
            messageElement.appendChild(repliesContainer);
        }
        
        messagesContainer.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // --- FUNCIÓN PARA ACTUALIZAR EL PANEL DE DEPURACIÓN ---
    function updateDebugPanel(intent, entities) {
        document.getElementById('debug-intent').textContent = intent || 'N/A';
        document.getElementById('debug-entities').textContent = entities ? JSON.stringify(entities, null, 2) : 'N/A';
        document.getElementById('debug-slots').textContent = JSON.stringify(conversationState, null, 2);
    }

    // --- FUNCIÓN DE PARSING (SIMULACIÓN NLU) ---
    function parseMessage(text) {
        const lowerText = text.toLowerCase();
        let intent = null;
        let entities = [];

        // Simulación de extracción de entidades
        if (lowerText.includes('me llamo') || lowerText.includes('soy') || lowerText.includes('mi nombre es')) {
            intent = 'inform_name';
            const nameMatch = text.match(/(?:me llamo|soy|mi nombre es)\s+(\w+)/i);
            if (nameMatch) {
                entities.push({ type: 'name', value: nameMatch[1] });
            }
        } else if (lowerText.includes('hola') || lowerText.includes('buenos días')) {
            intent = 'greet';
        }
        
        return { intent, entities };
    }

    // --- LÓGICA PRINCIPAL DE CONVERSIÓN (SIMULACIÓN CORE) ---
    function handleUserMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        displayMessage('user', userText);
        userInput.value = '';
        
        // Limpiar panel de depuración al inicio
        updateDebugPanel(null, null);

        setTimeout(() => {
            const { intent, entities } = parseMessage(userText);
            
            // Lógica del formulario
            if (conversationState.current_form_step === 'idle' && intent === 'greet') {
                conversationState.current_form_step = 'asking_name';
                displayMessage('bot', botResponses.ask_name);
            } else if (conversationState.current_form_step === 'asking_name') {
                const nameEntity = entities.find(e => e.type === 'name');
                if (nameEntity) {
                    conversationState.name = nameEntity.value;
                    conversationState.current_form_step = 'asking_color';
                    displayMessage('bot', botResponses.ask_color(conversationState.name));
                } else {
                    displayMessage('bot', botResponses.ask_name);
                }
            } else if (conversationState.current_form_step === 'asking_color') {
                // Aquí asumimos que cualquier texto es el color
                conversationState.favorite_color = userText;
                conversationState.current_form_step = 'complete';
                displayMessage('bot', botResponses.form_complete(conversationState.name, conversationState.favorite_color));
            } else {
                displayMessage('bot', botResponses.fallback);
            }
            
            // Actualizar el panel de depuración con los resultados
            updateDebugPanel(intent, entities);

        }, 500);
    }

    // --- EVENT LISTENERS ---
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleUserMessage();
        }
    });

    // Mensaje de bienvenida inicial
    displayMessage('bot', botResponses.greet);
});

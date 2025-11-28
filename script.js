document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatWindow = document.getElementById('chat-window');

    // --- ESTADO DE LA CONVERSACIÓN (SIMULACIÓN DE SLOTS) ---
    let slots = {
        name: null,
        color: null,
    };

    // --- ESTADO DEL FLUJO DE CONVERSIÓN ---
    let conversationPath = 'idle'; // idle, story_profile_form

    // --- RESPUESTAS DEL BOT (DEFINIDAS EN DOMAIN.YML) ---
    const responses = {
        utter_greet: "¡Hola! Soy un bot de demo. ¿Cómo te llamas?",
        utter_ask_name: "¿Cuál es tu nombre?",
        utter_ask_color: "¿Y cuál es tu color favorito?",
        utter_slots_values: (name, color) => `¡Perfecto! He guardado que te llamas ${name} y tu color favorito es ${color}.`,
        utter_goodbye: "¡Hasta luego!",
        utter_noworries: "No te preocupes.",
        utter_default: "Lo siento, no entendí eso. ¿Puedes decirlo de otra forma?"
    };

    // --- FUNCIÓN PARA MOSTRAR MENSAJES EN EL CHAT ---
    function displayMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // --- FUNCIÓN PARA ACTUALIZAR EL PANEL DE DEPURACIÓN ---
    function updateDebugPanel(intent, entities) {
        document.getElementById('debug-intent').textContent = intent || 'N/A';
        document.getElementById('debug-entities').textContent = entities ? JSON.stringify(entities) : 'N/A';
        document.getElementById('debug-slots').textContent = JSON.stringify(slots, null, 2);
        document.getElementById('debug-path').textContent = conversationPath;
    }

    // --- FUNCIÓN DE PARSING (SIMULACIÓN NLU) ---
    function parseMessage(text) {
        const lowerText = text.toLowerCase();
        let intent = 'nlu_fallback';
        let entities = [];

        // Lógica de detección de intenciones y entidades
        if (lowerText.includes('hola') || lowerText.includes('buenos días')) {
            intent = 'greet';
        } else if (lowerText.includes('adiós') || lowerText.includes('hasta luego')) {
            intent = 'goodbye';
        } else if (lowerText.includes('sí') || lowerText.includes('correcto')) {
            intent = 'affirm';
        } else if (lowerText.includes('no') || lowerText.includes('incorrecto')) {
            intent = 'deny';
        } else {
            const nameMatch = text.match(/(?:me llamo|soy|mi nombre es)\s+([A-Za-z]+)/i);
            if (nameMatch) {
                intent = 'inform_name';
                entities.push({ type: 'name', value: nameMatch[1] });
            } else {
                const colorMatch = text.match(/(?:color favorito es|me gusta el)\s+([A-Za-z]+)/i);
                if (colorMatch) {
                    intent = 'inform_color';
                    entities.push({ type: 'color', value: colorMatch[1] });
                } else if (conversationPath === 'story_profile_form' && slots.name && !slots.color) {
                    // Si estamos esperando el color, asumimos que lo que se escribió es el color
                    intent = 'inform_color';
                    entities.push({ type: 'color', value: text.trim() });
                }
            }
        }
        return { intent, entities };
    }
    
    // --- LÓGICA PRINCIPAL DEL BOT (SIMULACIÓN CORE) ---
    function handleUserMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        displayMessage('user', userText);
        userInput.value = '';
        updateDebugPanel(null, null); // Limpiar panel

        setTimeout(() => {
            const { intent, entities } = parseMessage(userText);
            let botResponse = responses.utter_default;
            
            // LÓGICA DE REGLAS (RULES) - Prioridad alta
            if (intent === 'goodbye') {
                botResponse = responses.utter_goodbye;
                conversationPath = 'idle';
                slots = { name: null, color: null }; // Resetear estado
            } else if (intent === 'affirm') {
                botResponse = responses.utter_noworries;
            } 
            // LÓGICA DE HISTORIAS (STORIES)
            else if (intent === 'greet') {
                botResponse = responses.utter_greet;
                conversationPath = 'story_profile_form';
            } else if (conversationPath === 'story_profile_form') {
                if (intent === 'inform_name' && entities.length > 0) {
                    slots.name = entities.find(e => e.type === 'name').value;
                    botResponse = responses.utter_ask_color;
                } else if (intent === 'inform_color' && entities.length > 0) {
                    slots.color = entities.find(e => e.type === 'color').value;
                    botResponse = responses.utter_slots_values(slots.name, slots.color);
                    conversationPath = 'idle'; // Fin de la historia
                } else if (!slots.name) {
                    botResponse = responses.utter_ask_name;
                } else if (!slots.color) {
                    botResponse = responses.utter_ask_color;
                }
            }
            
            displayMessage('bot', botResponse);
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
    displayMessage('bot', "¡Hola! Escribe 'hola' para empezar a crear tu perfil.");
});

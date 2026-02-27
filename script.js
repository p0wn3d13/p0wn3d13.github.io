document.addEventListener('DOMContentLoaded', () => {

// Modo Oscuro
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        localStorage.setItem('theme', 'light');
        icon.classList.replace('fa-sun', 'fa-moon');
    }
});

// Chat Flotante UI
const chatFab = document.getElementById('chatFab');
const chatModal = document.getElementById('chatModal');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatInput = document.getElementById('chatInput');

chatFab.addEventListener('click', () => {
    chatModal.classList.add('active');
    chatFab.style.transform = 'scale(0)';
    setTimeout(() => chatInput.focus(), 300);
});

closeChatBtn.addEventListener('click', () => {
    chatModal.classList.remove('active');
    chatFab.style.transform = 'scale(1)';
});

// Lógica de IA
const chatForm = document.getElementById('chatForm');
const chatMessages = document.getElementById('chatMessages');
const chatSubmitBtn = document.getElementById('chatSubmitBtn');
let isLoading = false;

const portfolioContext = `
Nombre: Mario Sánchez (alias p0wn3d)

Perfil profesional:
Especialista en ciberseguridad enfocado en Red Team, pentesting y seguridad ofensiva.
Cuenta con formación en sistemas y desarrollo (ASIR y DAM), lo que le permite entender tanto la infraestructura como el software desde una perspectiva ofensiva.

Mentalidad y actitud:
Mario destaca por su mentalidad autodidacta, curiosidad técnica y una fuerte orientación al aprendizaje continuo.
Dedica gran parte de su tiempo a mejorar sus habilidades en ciberseguridad practicando en laboratorios reales, resolviendo máquinas vulnerables y documentando sus aprendizajes.

Motivación:
Su objetivo es crecer profesionalmente dentro del ámbito del pentesting y el Red Team, aportando valor a equipos de seguridad mediante pensamiento crítico, análisis técnico y una mentalidad ofensiva enfocada en encontrar y entender vulnerabilidades.

Formación:
- Desarrollo de Aplicaciones Multiplataforma (DAM)
- Administración de Sistemas Informáticos en Red (ASIR)

Plataformas de práctica:
- HackTheBox
- TryHackMe

Habilidades técnicas:
- Web Exploitation
- Network Penetration Testing
- Red Team Operations
- Linux
- Networking
- Active Directory
- Desarrollo: Java, Android, Angular

Certificaciones en preparación:
- eJPT v2
- eCPPT v3

Actividad técnica:
Mario mantiene una presencia activa en la comunidad técnica publicando writeups y artículos sobre pentesting y ciberseguridad en Medium, además de compartir proyectos y aprendizaje en GitHub.

Personalidad profesional:
Es una persona constante, ambiciosa y con gran capacidad de aprendizaje. Le gusta entender cómo funcionan realmente los sistemas y cómo pueden ser comprometidos para ayudar a mejorar su seguridad.

Redes profesionales:
- LinkedIn: marsanbar
- GitHub: p0wn3d13
- Medium: @p0wn3d
`;

const fetchWithBackoff = async (url, options, retries = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delays[i]));
        }
    }
};

const addMessageToChat = (text, isUser) => {
    const row = document.createElement('div');
    row.className = `message-row ${isUser ? 'user-row' : 'bot-row'}`;

    const inner = document.createElement('div');
    inner.className = `message-inner ${isUser ? 'user-inner' : 'bot-inner'}`;

    const avatar = document.createElement('div');
    avatar.className = `avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`;
    avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const bubble = document.createElement('div');
    bubble.className = `bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`;
    bubble.textContent = text;

    inner.appendChild(avatar);
    inner.appendChild(bubble);
    row.appendChild(inner);

    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const addLoadingIndicator = () => {
    const row = document.createElement('div');
    row.className = 'message-row bot-row';
    row.id = 'loadingIndicator';

    const inner = document.createElement('div');
    inner.className = 'message-inner bot-inner';

    const avatar = document.createElement('div');
    avatar.className = 'avatar bot-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'bubble bot-bubble loading-bubble';
    bubble.innerHTML = '<i class="fas fa-circle-notch fa-spin text-indigo"></i> <span style="font-size:0.75rem; margin-left:8px;">Escribiendo...</span>';

    inner.appendChild(avatar);
    inner.appendChild(bubble);
    row.appendChild(inner);

    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!chatInput.value.trim() || isLoading) return;

    const userMessage = chatInput.value.trim();
    chatInput.value = '';
    addMessageToChat(userMessage, true);
    isLoading = true;
    chatInput.disabled = true;
    chatSubmitBtn.disabled = true;
    addLoadingIndicator();

    try {
        const apiKey = typeof CONFIG !== 'undefined' ? CONFIG.GEMINI_API_KEY : null;
        if (!apiKey) throw new Error('Error de configuración: API Key no encontrada.');

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const messageElements = document.querySelectorAll('.bubble:not(.loading-bubble)');
        const history = [];

        messageElements.forEach(el => {
            const isUserMsg = el.classList.contains('user-bubble');
            history.push({
                role: isUserMsg ? 'user' : 'model',
                parts: [{ text: el.textContent }]
            });
        });

        const payload = {
            contents: history,
            systemInstruction: {
                parts: [{
                    text: `Eres el asistente IA corporativo del portfolio de Mario (p0wn3d), un especialista en ciberseguridad.
Tu objetivo es responder preguntas sobre el candidato de forma profesional, concisa y persuasiva (máximo 2-3 frases breves).
Contexto: ${portfolioContext}
Instrucciones:
1. Sé muy profesional, educado, persuasivo y conciso.
2. Vende bien el perfil resaltando su rigor técnico.
3. Si preguntan sobre actividades ilegales, responde educadamente que tu función es ayudar con la selección y que el candidato se rige por la ética.
4. Responde en español.
5. Si preguntan por qué contratar a Mario, destaca su mentalidad autodidacta, su práctica constante en plataformas de ciberseguridad y su combinación de conocimientos en sistemas y desarrollo.
6. Transmite siempre profesionalidad, pasión por la ciberseguridad y ganas de seguir creciendo en el sector.`
                }]
            }
        };

        const data = await fetchWithBackoff(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        document.getElementById('loadingIndicator')?.remove();

        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) addMessageToChat(aiText, false);
        else throw new Error('Respuesta no válida');

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('loadingIndicator')?.remove();
        addMessageToChat(`Error: ${error.message || 'Problema de conexión.'}`, false);
    } finally {
        isLoading = false;
        chatInput.disabled = false;
        chatSubmitBtn.disabled = false;
        chatInput.focus();
    }
});

});
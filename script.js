// Initialize Icons
lucide.createIcons();

// --- 1. FIXED LOADING TRANSITION ---
// Reduced delay from 1500ms to 600ms for faster navigation
function navigateWithLoader(url) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.add('active');
        // Faster timeout
        setTimeout(() => {
            window.location.href = url;
        }, 600);
    } else {
        window.location.href = url;
    }
}

// --- 2. GLOBAL VISUALS (Cursor & Snow) ---
const dot = document.getElementById('cursor-dot');
const outline = document.getElementById('cursor-outline');
window.addEventListener('mousemove', (e) => {
    if (dot && outline) {
        dot.style.opacity = outline.style.opacity = "1";
        dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
        outline.animate({ transform: `translate(${e.clientX - 22}px, ${e.clientY - 22}px)` }, { duration: 500, fill: "forwards" });
    }
});

const canvas = document.getElementById('snow-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();
    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedY = Math.random() * 0.5 + 0.2;
            this.speedX = Math.random() * 0.2 - 0.1;
            this.opacity = Math.random() * 0.3 + 0.1;
        }
        update() { this.y += this.speedY; this.x += this.speedX; if (this.y > canvas.height) this.y = -5; }
        draw() { ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
    }
    for (let i = 0; i < 60; i++) particles.push(new Particle());
    function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); }
    animate();
}

// --- 3. SCROLL REVEAL ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// --- 4. DASHBOARD LOGIC (Runs only on dashboard.html) ---
if (document.getElementById('dashboardContent')) {
    
    // UI Helpers
    window.showContent = function(contentId) {
        document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
        document.querySelectorAll('.active-tab').forEach(b => b.classList.remove('active-tab'));
        const target = document.getElementById(contentId + 'Content');
        if(target) target.classList.remove('hidden');
        const btn = document.getElementById('btn-' + contentId);
        if(btn) btn.classList.add('active-tab');
    };
    
    window.toggleDropdown = function(e) {
        e.preventDefault();
        document.getElementById('class-dropdown').classList.toggle('hidden');
    };

    // AI Variables
    let currentClassId = '';
    const studentDatabase = {
        classA: ['ganesh', 'sai charan', 'madhan', 'lal shah', 'prasana kumar', 'abhishek', 'anudeep', 'mustafa', 'akif', 'ashok', 'pavan', 'chandraa sekhar', 'murari', 'arun', 'kaushal', 'chandan', 'sai ganesh', 'shaheid'],
        classB: ['kevin', 'lisa', 'mike']
    };
    let labeledDescriptors = [];
    let faceMatcher;
    const MATCH_THRESHOLD = 0.48;

    // Elements
    const knownFacesInput = document.getElementById('knownFacesInput');
    const groupPhotoInput = document.getElementById('groupPhotoInput');
    const knownFacesContainer = document.getElementById('knownFacesContainer');
    const groupPhotoImg = document.getElementById('groupPhoto');
    const outputCanvas = document.getElementById('outputCanvas');
    const recognizeButton = document.getElementById('recognizeButton');
    const statusMessage = document.getElementById('statusMessage');
    const attendanceTitle = document.getElementById('attendanceTitle');
    const attendanceResults = document.getElementById('attendanceResults');

    // AI Logic
    async function loadModels() {
        if(statusMessage) statusMessage.textContent = 'Booting Neural Engines...';
        const modelPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
        if(statusMessage) statusMessage.textContent = 'Attendrix Core: Active.';
    }

    window.showAttendanceContent = function(classId) {
        currentClassId = classId;
        showContent('attendance');
        attendanceTitle.textContent = `${classId.toUpperCase()} Processing`;
        statusMessage.textContent = `Target: ${classId.toUpperCase()}`;
        clearAttendanceView();
    };

    function clearAttendanceView() {
        knownFacesInput.value = '';
        groupPhotoInput.value = '';
        knownFacesContainer.innerHTML = '';
        groupPhotoImg.src = '';
        const ctx = outputCanvas.getContext('2d');
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        attendanceResults.classList.add('hidden');
        labeledDescriptors = [];
        recognizeButton.disabled = true;
    }

    async function createLabeledFaceDescriptors(files) {
        const descriptors = [];
        statusMessage.textContent = `Syncing Student Data...`;
        knownFacesContainer.innerHTML = '';
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const label = file.name.split('.')[0].toLowerCase().trim();
            if (!studentDatabase[currentClassId]?.includes(label)) continue;
            try {
                const img = await faceapi.bufferToImage(file);
                const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                if (detection) {
                    descriptors.push(new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]));
                    const wrap = document.createElement('div');
                    wrap.className = "flex flex-col items-center gap-2";
                    const prev = document.createElement('img');
                    prev.src = URL.createObjectURL(file);
                    prev.className = "w-20 h-20 object-cover rounded-full border-2 border-indigo-600 shadow-xl shadow-indigo-600/20";
                    const nm = document.createElement('span');
                    nm.className = "text-[9px] font-black uppercase text-gray-500";
                    nm.textContent = label;
                    wrap.appendChild(prev); wrap.appendChild(nm);
                    knownFacesContainer.appendChild(wrap);
                }
            } catch (e) { console.error(e); }
        }
        labeledDescriptors = descriptors;
        statusMessage.textContent = `System Synchronized.`;
        checkReadyToRecognize();
    }

    function checkReadyToRecognize() {
        if (labeledDescriptors.length > 0 && groupPhotoImg.src) {
            faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, MATCH_THRESHOLD);
            recognizeButton.disabled = false;
            statusMessage.textContent = 'Thermal Scan Ready.';
// Initialize Icons
lucide.createIcons();

// --- 1. FIXED LOADING TRANSITION ---
// Reduced delay from 1500ms to 600ms for faster navigation
function navigateWithLoader(url) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.add('active');
        // Faster timeout
        setTimeout(() => {
            window.location.href = url;
        }, 600);
    } else {
        window.location.href = url;
    }
}

// --- 2. GLOBAL VISUALS (Cursor & Snow) ---
const dot = document.getElementById('cursor-dot');
const outline = document.getElementById('cursor-outline');
window.addEventListener('mousemove', (e) => {
    if (dot && outline) {
        dot.style.opacity = outline.style.opacity = "1";
        dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
        outline.animate({ transform: `translate(${e.clientX - 22}px, ${e.clientY - 22}px)` }, { duration: 500, fill: "forwards" });
    }
});

const canvas = document.getElementById('snow-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();
    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedY = Math.random() * 0.5 + 0.2;
            this.speedX = Math.random() * 0.2 - 0.1;
            this.opacity = Math.random() * 0.3 + 0.1;
        }
        update() { this.y += this.speedY; this.x += this.speedX; if (this.y > canvas.height) this.y = -5; }
        draw() { ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
    }
    for (let i = 0; i < 60; i++) particles.push(new Particle());
    function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); }
    animate();
}

// --- 3. SCROLL REVEAL ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// --- 4. DASHBOARD LOGIC (Runs only on dashboard.html) ---
if (document.getElementById('dashboardContent')) {
    
    // UI Helpers
    window.showContent = function(contentId) {
        document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
        document.querySelectorAll('.active-tab').forEach(b => b.classList.remove('active-tab'));
        const target = document.getElementById(contentId + 'Content');
        if(target) target.classList.remove('hidden');
        const btn = document.getElementById('btn-' + contentId);
        if(btn) btn.classList.add('active-tab');
    };
    
    window.toggleDropdown = function(e) {
        e.preventDefault();
        document.getElementById('class-dropdown').classList.toggle('hidden');
    };

    // AI Variables
    let currentClassId = '';
    const studentDatabase = {
        classA: ['ganesh', 'sai charan', 'madhan', 'lal shah', 'prasana kumar', 'abhishek', 'anudeep', 'mustafa', 'akif', 'ashok', 'pavan', 'chandraa sekhar', 'murari', 'arun', 'kaushal', 'chandan', 'sai ganesh', 'shaheid'],
        classB: ['kevin', 'lisa', 'mike']
    };
    let labeledDescriptors = [];
    let faceMatcher;
    const MATCH_THRESHOLD = 0.48;

    // Elements
    const knownFacesInput = document.getElementById('knownFacesInput');
    const groupPhotoInput = document.getElementById('groupPhotoInput');
    const knownFacesContainer = document.getElementById('knownFacesContainer');
    const groupPhotoImg = document.getElementById('groupPhoto');
    const outputCanvas = document.getElementById('outputCanvas');
    const recognizeButton = document.getElementById('recognizeButton');
    const statusMessage = document.getElementById('statusMessage');
    const attendanceTitle = document.getElementById('attendanceTitle');
    const attendanceResults = document.getElementById('attendanceResults');

    // AI Logic
    async function loadModels() {
        if(statusMessage) statusMessage.textContent = 'Booting Neural Engines...';
        const modelPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
        if(statusMessage) statusMessage.textContent = 'Attendrix Core: Active.';
    }

    window.showAttendanceContent = function(classId) {
        currentClassId = classId;
        showContent('attendance');
        attendanceTitle.textContent = `${classId.toUpperCase()} Processing`;
        statusMessage.textContent = `Target: ${classId.toUpperCase()}`;
        clearAttendanceView();
    };

    function clearAttendanceView() {
        knownFacesInput.value = '';
        groupPhotoInput.value = '';
        knownFacesContainer.innerHTML = '';
        groupPhotoImg.src = '';
        const ctx = outputCanvas.getContext('2d');
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        attendanceResults.classList.add('hidden');
        labeledDescriptors = [];
        recognizeButton.disabled = true;
    }

    async function createLabeledFaceDescriptors(files) {
        const descriptors = [];
        statusMessage.textContent = `Syncing Student Data...`;
        knownFacesContainer.innerHTML = '';
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const label = file.name.split('.')[0].toLowerCase().trim();
            if (!studentDatabase[currentClassId]?.includes(label)) continue;
            try {
                const img = await faceapi.bufferToImage(file);
                const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                if (detection) {
                    descriptors.push(new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]));
                    const wrap = document.createElement('div');
                    wrap.className = "flex flex-col items-center gap-2";
                    const prev = document.createElement('img');
                    prev.src = URL.createObjectURL(file);
                    prev.className = "w-20 h-20 object-cover rounded-full border-2 border-indigo-600 shadow-xl shadow-indigo-600/20";
                    const nm = document.createElement('span');
                    nm.className = "text-[9px] font-black uppercase text-gray-500";
                    nm.textContent = label;
                    wrap.appendChild(prev); wrap.appendChild(nm);
                    knownFacesContainer.appendChild(wrap);
                }
            } catch (e) { console.error(e); }
        }
        labeledDescriptors = descriptors;
        statusMessage.textContent = `System Synchronized.`;
        checkReadyToRecognize();
    }

    function checkReadyToRecognize() {
        if (labeledDescriptors.length > 0 && groupPhotoImg.src) {
            faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, MATCH_THRESHOLD);
            recognizeButton.disabled = false;
            statusMessage.textContent = 'Thermal Scan Ready.';
        }
    }

    if(knownFacesInput) {
        knownFacesInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) createLabeledFaceDescriptors(Array.from(e.target.files));
        });
    }

    if(groupPhotoInput) {
        groupPhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                groupPhotoImg.src = URL.createObjectURL(file);
                groupPhotoImg.onload = () => {
                    outputCanvas.width = groupPhotoImg.offsetWidth;
                    outputCanvas.height = groupPhotoImg.offsetHeight;
                    checkReadyToRecognize();
                };
            }
        });
    }
    
    // Boot up
    loadModels();
}

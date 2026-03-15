// ============================================================================
// VARIABLES GLOBALES
// ============================================================================
let entries = [];
const REFRESH_INTERVAL = 3000; // Actualizar cada 3 segundos

// ============================================================================
// FUNCIÓN DE NOTIFICACIONES
// ============================================================================
function showToast(message, type = 'info', autoHide = true) {

    const toastEl = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    const typeMap = {
        success: 'bg-success',
        error: 'bg-danger',
        danger: 'bg-danger',
        info: 'bg-info'
    };

    toastEl.className =
        `toast align-items-center text-white ${typeMap[type] || 'bg-info'} border-0`;

    const toast = new bootstrap.Toast(toastEl, {
        autohide: autoHide,
        delay: 2000
    });

    toast.show();

    return toast; // 👈 IMPORTANTE
}
// ============================================================================
// CARGAR ENTRADAS DESDE EL BACKEND
// ============================================================================
async function loadEntries() {
    try {
        const response = await fetch('/api/entries');
        if (!response.ok) throw new Error('Error al cargar entradas');
        
        entries = await response.json();
        renderGallery();
        updateStats();
    } catch (error) {
        console.error('Error cargando entradas:', error);
    }
}

// ============================================================================
// MANEJAR ENVÍO DEL FORMULARIO
// ============================================================================
async function handleSubmit(event) {

    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const team = document.querySelector('input[name="team"]:checked')?.value;
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    // VALIDACIONES

    if (!name) {
        showToast('Escribe tu nombre', 'error');
        return;
    }

    if (!team) {
        showToast('Elige tu equipo', 'error');
        return;
    }

    if (!file) {
        showToast('Debes subir foto o video', 'error');
        return;
    }

    // Toast sin autohide
    const loadingToast = showToast(
        'Subiendo archivo... espera',
        'info',
        false // 👈 NO se cierra solo
    );

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('team', team);

    try {

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error();

        // cerrar toast manual
        loadingToast.hide();

        showToast('Archivo subido correctamente', 'success');

        setTimeout(() => {
            location.reload();
        }, 1500);

    } catch (err) {

        loadingToast.hide();

        showToast('Error al subir archivo', 'error');

        console.error(err);
    }
}

// ============================================================================
// RENDERIZAR GALERÍA
// ============================================================================
function renderGallery() {
    const container = document.getElementById('galleryContainer');
    
    if (entries.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted fs-5">Sin participantes aún. ¡Sé el primero! 🎉</p></div>';
        return;
    }

    container.innerHTML = '';

    entries.forEach((entry, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 fade-in';

        const item = document.createElement('div');
        item.className = 'gallery-item';

        let mediaHtml = '';
        if (entry.fileUrl) {
            if (entry.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                mediaHtml = `<img src="${entry.fileUrl}" alt="Participación de ${entry.name}" class="gallery-img" onerror="this.src='https://via.placeholder.com/400x300?text=Foto+no+disponible'">`;
            } else if (entry.fileUrl.match(/\.(mp4|webm|ogg|avi)$/i)) {
                mediaHtml = `<video controls class="gallery-img"><source src="${entry.fileUrl}" type="video/mp4">Tu navegador no soporta video</video>`;
            } else {
                mediaHtml = `<div class="gallery-img d-flex align-items-center justify-content-center bg-light"><span class="text-muted">📁 Archivo</span></div>`;
            }
        } else {
            mediaHtml = `<div class="gallery-img d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%);"><span class="text-muted">🎉</span></div>`;
        }

        const teamBadge = entry.team === 'blue' 
            ? '<span class="gallery-team bg-primary">💙 Azul</span>'
            : '<span class="gallery-team bg-danger">🩷 Rosa</span>';

        item.innerHTML = `
            ${mediaHtml}
            <div class="gallery-content">
                <div class="gallery-name">👤 ${entry.name}</div>
                ${teamBadge}
            </div>
        `;

        col.appendChild(item);
        container.appendChild(col);
    });
}

// ============================================================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================================================
function updateStats() {
    const blueEntries = entries.filter(e => e.team === 'blue');
    const pinkEntries = entries.filter(e => e.team === 'pink');
    const totalCount = entries.length;

    const blueCount = blueEntries.length;
    const pinkCount = pinkEntries.length;

    // Actualizar números
    document.getElementById('blueVotes').textContent = blueCount;
    document.getElementById('pinkVotes').textContent = pinkCount;
    document.getElementById('blueCount').textContent = blueCount;
    document.getElementById('pinkCount').textContent = pinkCount;

    // Actualizar barras de progreso
    const bluePercent = totalCount > 0 ? (blueCount / totalCount) * 100 : 0;
    const pinkPercent = totalCount > 0 ? (pinkCount / totalCount) * 100 : 0;

    const blueBar = document.getElementById('blueProgressBar');
    const pinkBar = document.getElementById('pinkProgressBar');

    if (blueBar) blueBar.style.width = bluePercent + '%';
    if (pinkBar) pinkBar.style.width = pinkPercent + '%';
}

// ============================================================================
// PREVIEW DE ARCHIVOS
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para el formulario
    const participationForm = document.getElementById('participationForm');
    if (participationForm) {
        participationForm.addEventListener('submit', handleSubmit);
    }

    // Event listener para el input de archivo
    const fileInput = document.getElementById('file');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById('filePreview');

            if (file) {
                preview.classList.remove('d-none');
                
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                    };
                    reader.readAsDataURL(file);
                } else if (file.type.startsWith('video/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        preview.innerHTML = `<video controls style="max-width: 100%;"><source src="${event.target.result}" type="${file.type}"></video>`;
                    };
                    reader.readAsDataURL(file);
                } else {
                    preview.innerHTML = `<p class="text-center text-muted">📁 Archivo: ${file.name}</p>`;
                }
            } else {
                preview.classList.add('d-none');
                preview.innerHTML = '';
            }
        });
    }

    // Drag and drop para archivo
    const fileUploadArea = document.querySelector('.file-upload-area');
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = 'var(--primary-blue)';
            fileUploadArea.style.background = 'rgba(59, 130, 246, 0.1)';
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.style.borderColor = '#cbd5e1';
            fileUploadArea.style.background = '';
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = '#cbd5e1';
            fileUploadArea.style.background = '';
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });
    }

    // Cargar entradas iniciales
    loadEntries();
});
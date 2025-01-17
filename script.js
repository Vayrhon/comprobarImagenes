 // Botones para seleccionar imágenes o carpetas
 document.getElementById('selectImagesBtn').addEventListener('click', function () {
    const input = document.getElementById('inputImagenes');
    input.value = '';
    input.click();
});

document.getElementById('selectFolderBtn').addEventListener('click', function () {
    const input = document.getElementById('inputCarpeta');
    input.value = '';
    input.click();
});

// Manejo de selección de imágenes
document.getElementById('inputImagenes').addEventListener('change', function (event) {
    console.log("Imágenes seleccionadas");
    handleFileSelection(event.target.files, false);
});

document.getElementById('inputCarpeta').addEventListener('change', function (event) {
    console.log("Carpeta seleccionada");
    handleFileSelection(event.target.files, true);
});

function showLoading() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    loading.style.display = 'none';
}

// Procesar archivos seleccionados
// Procesar archivos seleccionados
function handleFileSelection(files, isFolder) {
    resetView(); // Limpiar vistas y listas previas
    showLoading(); // Mostrar mensaje de cargando al iniciar el procesamiento

    if (!files || files.length === 0) {
        hideLoading(); // Ocultar mensaje si no hay archivos
        return;
    }

    const validImages = [];
    const invalidImages = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
        const fileSizeKB = (file.size / 1024).toFixed(2);
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        if (!fileType.startsWith('image/') && !fileName.endsWith('.heic')) {
            // Ignorar archivos no compatibles
            processedCount++;
            if (processedCount === files.length) {
                updateList(validImages, invalidImages, isFolder);
                hideLoading(); // Ocultar mensaje de cargando
            }
            return;
        }

        // Si el archivo es HEIC, convertirlo
        if (fileName.endsWith('.heic')) {
            heic2any({
                blob: file,
                toType: 'image/jpeg',
            })
                .then((convertedBlob) => {
                    const convertedFile = new File(
                        [convertedBlob],
                        fileName.replace('.heic', '.jpg'),
                        { type: 'image/jpeg' }
                    );
                    processImage(convertedFile, validImages, invalidImages, files.length, isFolder);
                })
                .catch((error) => {
                    console.error('Error al convertir HEIC:', error);
                    processedCount++;
                    if (processedCount === files.length) {
                        updateList(validImages, invalidImages, isFolder);
                        hideLoading(); // Ocultar mensaje de cargando
                    }
                });
        } else {
            // Procesar imágenes que no son HEIC
            processImage(file, validImages, invalidImages, files.length, isFolder);
        }
    });

    function processImage(file, validImages, invalidImages, totalFiles, isFolder) {
        const fileSizeKB = (file.size / 1024).toFixed(2);
        const fileName = file.name.toLowerCase();
    
        const reader = new FileReader();
    
        reader.onload = function (e) {
            const img = new Image();
    
            img.onload = function () {
                const originalWidth = img.width;
                const originalHeight = img.height;
    
                let status = 'cumple';
                const errors = [];
    
                if (originalWidth !== 300 || originalHeight !== 400) {
                    status = 'no cumple';
                    errors.push(`Dimensiones incorrectas (${originalWidth}x${originalHeight})`);
                }
    
                if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
                    status = 'no cumple';
                    errors.push('Formato no compatible');
                }
    
                // Convertir la imagen
                convertToJpeg(img, file.name, (jpegBlob, jpegUrl) => {
                    const transformedSizeKB = (jpegBlob.size / 1024).toFixed(2);
                    if (transformedSizeKB > 30) {
                        status = 'no cumple';
                        errors.push(`Tamaño convertido mayor a 30 KB (${transformedSizeKB} KB)`);
                    }
    
                    const listItem = `
                        <li class="${status === 'cumple' ? 'cumple' : 'no-cumple'}" style="display: flex; justify-content: space-between; align-items: left;">
                            <p style="color: ${status === 'cumple' ? '#155724' : '#721c24'};">
                                Nombre: <strong>${file.name}</strong> | Tamaño Original: ${fileSizeKB}KB | Dimensiones: ${originalWidth}x${originalHeight}px
                            </p>
                            ${status === 'no cumple' ? `
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span>Descargar ajustada</span>
                                <button class="resize-btn" data-file="${file.name}" data-src="${jpegUrl}" aria-label="Descargar">
                                    📥
                                </button>
                            </div>` : ''}
                        </li>
                    `;
    
                    if (status === 'cumple') validImages.push(listItem);
                    else invalidImages.push(listItem);
    
                    if (!isFolder && totalFiles === 1) {
                        const imageContainer = document.getElementById('imageContainer');
                        imageContainer.style.display = 'flex'; // Usar flexbox para centrar
                        imageContainer.style.flexDirection = 'column'; // Organizar título e imagen en columna
                        imageContainer.style.alignItems = 'center'; // Centrar horizontalmente
                        imageContainer.style.justifyContent = 'center'; // Centrar verticalmente
                        imageContainer.style.marginTop = '20px'; // Margen superior
                    
                        // Agregar el título "Vista Previa"
                        const previewTitle = document.getElementById('previewTitle');
                        if (previewTitle) {
                            previewTitle.style.display = 'block'; // Mostrar el título si ya existe
                        } else {
                            const title = document.createElement('h3');
                            title.id = 'previewTitle';
                            title.textContent = 'Vista Previa';
                            title.style.marginBottom = '10px'; // Margen inferior
                            imageContainer.prepend(title); // Agregar el título al contenedor
                        }
                    
                        // Mostrar la imagen en el contenedor
                        const preview = document.getElementById('preview');
                        preview.style.display = 'block';
                        preview.style.maxWidth = '100%'; // Ajustar al ancho disponible
                        preview.style.maxHeight = '400px'; // Limitar la altura
                        preview.src = jpegUrl; // Mostrar la imagen convertida
                    }
                    
    
                    processedCount++;
                    if (processedCount === totalFiles) {
                        updateList(validImages, invalidImages, isFolder);
                        bindResizeButtons(); // Asociar eventos a los botones
                        hideLoading(); // Ocultar mensaje de cargando
                    }
                });
            };
    
            img.src = e.target.result;
        };
    
        reader.readAsDataURL(file);
    }
    
    
    
}

function convertToJpeg(image, originalName, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Ajustar dimensiones a 300x400
    canvas.width = 300;
    canvas.height = 400;

    // Dibujar la imagen en el canvas
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Convertir a formato JPG/JPEG, asegurando que el tamaño sea menor a 30 KB
    let quality = 0.8; // Calidad inicial
    const targetSizeKB = 30; // Tamaño máximo en KB

    function tryConversion() {
        canvas.toBlob((blob) => {
            if (blob.size / 1024 > targetSizeKB && quality > 0.1) {
                // Reducir calidad y reintentar si excede el tamaño permitido
                quality -= 0.1;
                tryConversion();
            } else {
                const jpegUrl = URL.createObjectURL(blob);
                callback(blob, jpegUrl); // Devolver el Blob y la URL
            }
        }, 'image/jpeg', quality);
    }

    tryConversion();
}


// Asociar eventos a los botones de redimensionar
function bindResizeButtons() {
    const buttons = document.querySelectorAll('.resize-btn');
    buttons.forEach((button) => {
        button.addEventListener('click', function () {
            const fileName = this.dataset.file;
            const fileSrc = this.dataset.src;

            const link = document.createElement('a');
            link.href = fileSrc;
            link.download = fileName.replace(/\.[^/.]+$/, '.jpg'); // Descargar como JPG
            link.click();
        });
    });
}


// Redimensionar y descargar la imagen
function resizeAndDownload(src, fileName) {
    const img = new Image();
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 300; // Nuevas dimensiones
        canvas.height = 400;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convertir a Blob y descargar
        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `redimensionado_${fileName}`;
            link.click();
        }, 'image/jpeg', 0.8); // Calidad 0.8
    };
    img.src = src;
}

// Limpiar vistas y listas
function resetView() {
    document.getElementById('info').innerHTML = '';
    document.getElementById('info').style.display = 'none';
    document.getElementById('cumplenContainer').style.display = 'none';
    document.getElementById('noCumplenContainer').style.display = 'none';
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.style.display = 'none';
    const preview = document.getElementById('preview');
    preview.style.display = 'none';
    preview.src = '';
}

// Actualizar lista de resultados
function updateList(validImages, invalidImages, isFolder) {
    const cumplenContainer = document.getElementById('cumplenContainer');
    const noCumplenContainer = document.getElementById('noCumplenContainer');
    const bulkResizeContainer = document.getElementById('bulkResizeContainer');

    // Total de imágenes procesadas
    const totalImages = validImages.length + invalidImages.length;

    // Imágenes que cumplen
    if (validImages.length > 0) {
        cumplenContainer.innerHTML = `
            <h2>Cumple: ${validImages.length} de ${totalImages}</h2>
            <ul>${validImages.join('')}</ul>`;
        cumplenContainer.style.display = 'block';
    } else {
        cumplenContainer.style.display = 'none';
    }

    // Imágenes que no cumplen
    if (invalidImages.length > 0) {
        noCumplenContainer.innerHTML = `
            <h2>No cumple: ${invalidImages.length} de ${totalImages}</h2>
            <ul>${invalidImages.join('')}</ul>`;
        noCumplenContainer.style.display = 'block';

        // Mostrar el botón de redimensionar y descargar todo solo si se analizó una carpeta
        if (isFolder) {
            bulkResizeContainer.style.display = 'block'; // Asegurarse de que el contenedor sea visible
            if (!document.getElementById('bulkResizeBtn')) {
                const bulkResizeBtn = document.createElement('button');
                bulkResizeBtn.id = 'bulkResizeBtn';
                bulkResizeBtn.textContent = 'Redimensionar y Descargar Todo';
                bulkResizeBtn.style.marginTop = '10px';
                bulkResizeBtn.style.padding = '10px';
                bulkResizeBtn.style.backgroundColor = '#4CAF50';
                bulkResizeBtn.style.color = 'white';
                bulkResizeBtn.style.border = 'none';
                bulkResizeBtn.style.borderRadius = '5px';
                bulkResizeBtn.style.cursor = 'pointer';

                bulkResizeBtn.addEventListener('click', async function () {
                    bulkResizeBtn.disabled = true; // Deshabilitar botón
                    bulkResizeBtn.textContent = 'Redimensionando'; // Cambiar texto del botón
                    bulkResizeBtn.style.cursor = 'not-allowed';

                    const invalidImagesData = Array.from(
                        document.querySelectorAll('.no-cumple .resize-btn')
                    ).map((button) => ({
                        src: button.dataset.src,
                        fileName: button.dataset.file,
                    }));

                    await resizeAndDownloadAllInvalid(invalidImagesData);

                    bulkResizeBtn.disabled = false; // Habilitar botón
                    bulkResizeBtn.textContent = 'Redimensionar y Descargar Todo'; // Restaurar texto del botón
                    bulkResizeBtn.style.cursor = 'pointer';
                });

                bulkResizeContainer.appendChild(bulkResizeBtn);
            }
        } else {
            bulkResizeContainer.style.display = 'none'; // Ocultar el contenedor si no se analizó una carpeta
        }
    } else {
        noCumplenContainer.style.display = 'none';
        bulkResizeContainer.style.display = 'none';
    }
}



async function resizeAndDownloadAllInvalid(invalidImagesData) {
    const zip = new JSZip(); // Crear el archivo ZIP
    const folder = zip.folder('imagenes-ajustadas'); // Carpeta dentro del ZIP
    const targetWidth = 300; // Dimensiones objetivo
    const targetHeight = 400;
    const quality = 0.8; // Calidad inicial
    const targetSizeKB = 30; // Tamaño máximo en KB

    for (let index = 0; index < invalidImagesData.length; index++) {
        const imageData = invalidImagesData[index];
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Evitar problemas de CORS

        await new Promise((resolve) => {
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                function tryConversion(q) {
                    canvas.toBlob((blob) => {
                        if (blob.size / 1024 > targetSizeKB && q > 0.1) {
                            // Reducir calidad y reintentar si excede el tamaño permitido
                            tryConversion(q - 0.1);
                        } else {
                            const fileName = imageData.fileName.replace(/\.[^/.]+$/, '.jpg'); // Reemplazar extensión por .jpg
                            folder.file(fileName, blob); // Agregar la imagen al ZIP
                            resolve();
                        }
                    }, 'image/jpeg', q);
                }

                tryConversion(quality); // Intentar conversión con calidad inicial
            };

            img.onerror = function () {
                console.error(`Error al cargar la imagen: ${imageData.fileName}`);
                resolve(); // Continuar con la siguiente imagen
            };

            img.src = imageData.src; // Establecer la fuente de la imagen
        });
    }

    // Generar y descargar el ZIP cuando todas las imágenes estén procesadas
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'imagenes-ajustadas.zip';
    link.click();
}




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
function handleFileSelection(files, isFolder) {
    resetView(); // Limpiar vistas y listas previas
    showLoading(); // Mostrar mensaje de cargando al iniciar el procesamiento

    // Ocultar el botón de "Descargar Todo" inmediatamente
    const bulkResizeContainer = document.getElementById('bulkResizeContainer');
    bulkResizeContainer.style.display = 'none';

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

    // function processImage(file, validImages, invalidImages, totalFiles, isFolder) {
    //     const fileSizeKB = (file.size / 1024).toFixed(2);
    //     const fileName = file.name.toLowerCase();

    //     const reader = new FileReader();

    //     reader.onload = function (e) {
    //         const img = new Image();

    //         img.onload = function () {
    //             const originalWidth = img.width;
    //             const originalHeight = img.height;

    //             let status = 'cumple';
    //             const errors = [];

    //             if (originalWidth !== 300 || originalHeight !== 400) {
    //                 status = 'no cumple';
    //                 errors.push(`Dimensiones incorrectas (${originalWidth}x${originalHeight})`);
    //             }

    //             if (fileSizeKB > 30) {
    //                 status = 'no cumple';
    //                 errors.push(`Tamaño excede 30 KB (${fileSizeKB} KB)`);
    //             }

    //             if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
    //                 status = 'no cumple';
    //                 errors.push('Formato no compatible');
    //             }

    //             // Convertir la imagen
    //             convertToJpeg(img, file.name, (jpegBlob, jpegUrl) => {
    //                 const transformedSizeKB = (jpegBlob.size / 1024).toFixed(2);

    //                 const listItem = `
    //                     <li class="${status === 'cumple' ? 'cumple' : 'no-cumple'}" style="display: flex; justify-content: space-between; align-items: left;">
    //                         <p style="color: ${status === 'cumple' ? '#155724' : '#721c24'}; text-align: justify;">
    //                             Nombre: <strong>${file.name}</strong> | Tamaño Original: ${fileSizeKB}KB | Dimensiones: ${originalWidth}x${originalHeight}px
    //                         </p>
    //                         ${status === 'no cumple' && isFolder ? `
    //                         <div style="display: flex; align-items: center; gap: 10px; text-align: justify;">
    //                             <span>Descargar Ajustada</span>
    //                             <button class="resize-btn" data-file="${file.name}" data-src="${jpegUrl}" aria-label="Descargar">
    //                                 📥
    //                             </button>
    //                         </div>` : ''}
    //                     </li>
    //                 `;

    //                 if (status === 'cumple') validImages.push(listItem);
    //                 else invalidImages.push(listItem);
    //                 if (!isFolder && totalFiles === 1 && status === 'no cumple') {
    //                     const imageContainer = document.getElementById('imageContainer');
    //                     imageContainer.style.display = 'flex';
    //                     imageContainer.style.flexDirection = 'row'; // Colocar elementos en fila
    //                     imageContainer.style.alignItems = 'center';
    //                     imageContainer.style.justifyContent = 'center'; // Centrar la fila
    //                     imageContainer.style.gap = '20px'; // Espaciado entre imagen y texto
    //                     imageContainer.style.marginTop = '20px';


    //                     // Mostrar la imagen ajustada
    //                     const preview = document.getElementById('preview');
    //                     preview.style.display = 'block';
    //                     preview.style.maxWidth = '300px';
    //                     preview.style.maxHeight = '400px';
    //                     preview.src = jpegUrl;

    //                     // Mostrar las nuevas dimensiones, peso, formato y botón en un contenedor
    //                     const previewInfo = document.getElementById('previewInfo');
    //                     if (previewInfo) {
    //                         previewInfo.style.display = 'block';
    //                         previewInfo.innerHTML = `
    //                             <div style="text-align: justify; display: flex; flex-direction: column; align-items: center; gap: 10px;">
    //                                 <p><strong>Vista previa:</strong></p>
    //                                 <p><strong>Nueva Dimensión:</strong> 300x400px</p>
    //                                 <p><strong>Nuevo Tamaño:</strong> ${transformedSizeKB} KB</p>
    //                                 <p><strong>Nuevo Formato:</strong> JPEG</p>
    //                                 <button class="resize-btn" data-file="${file.name}" data-src="${jpegUrl}" aria-label="Descargar" style="background: none; border: none; cursor: pointer; font-size: 24px;">
    //                                     📥
    //                                 </button>
    //                             </div>
    //                         `;
    //                     } else {
    //                         const info = document.createElement('div');
    //                         info.id = 'previewInfo';
    //                         info.style.marginLeft = '10px'; // Margen a la izquierda de la imagen
    //                         info.style.padding = '10px'; // Espaciado interno
    //                         info.style.border = '1px solid #ccc'; // Bordes
    //                         info.style.borderRadius = '5px'; // Bordes redondeados
    //                         info.style.textAlign = 'justify'; // Justificar texto
    //                         info.style.backgroundColor = '#f9f9f9'; // Fondo claro
    //                         info.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; // Sombra ligera
    //                         info.style.display = 'block'; // Bloque para manejar el contenido fácilmente

    //                         info.innerHTML = `
    //                             <div style="text-align: center;">
    //                                 <p style="text-align: justify; margin: 5px 10px;"><strong>Nueva Dimensión:</strong> 300x400px</p>
    //                                 <p style="text-align: justify; margin: 5px 10px;"><strong>Nuevo Tamaño:</strong> ${transformedSizeKB} KB</p>
    //                                 <p style="text-align: justify; margin: 5px 10px;"><strong>Nuevo Formato:</strong> JPEG</p>
    //                                 <button class="resize-btn" data-file="${file.name}" data-src="${jpegUrl}" aria-label="Descargar"
    //                                     style="background: none;  border-radius: 5px; cursor: pointer; font-size: 18px; padding: 10px; display: inline-flex; align-items: center; gap: 8px;">
    //                                     <strong style="color: green;">DESCARGAR</strong>
    //                                     📥
    //                                 </button>
    //                             </div>
    //                         `;

    //                         imageContainer.appendChild(info);
    //                     }
    //                 }

    //                 processedCount++;
    //                 if (processedCount === totalFiles) {
    //                     updateList(validImages, invalidImages, isFolder);
    //                     bindResizeButtons();
    //                     hideLoading();
    //                 }
    //             });
    //         };

    //         img.src = e.target.result;
    //     };

    //     reader.readAsDataURL(file);
    // }
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
    
                if (fileSizeKB > 30) {
                    status = 'no cumple';
                    errors.push(`Tamaño excede 30 KB (${fileSizeKB} KB)`);
                }
    
                if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
                    status = 'no cumple';
                    errors.push('Formato no compatible');
                }
    
                convertToJpeg(img, file.name, (jpegBlob, jpegUrl) => {
                    const transformedSizeKB = (jpegBlob.size / 1024).toFixed(2);
    
                    const listItem = `
                        <li class="${status === 'cumple' ? 'cumple' : 'no-cumple'}" style="display: flex; justify-content: space-between; align-items: left;">
                            <p style="color: ${status === 'cumple' ? '#155724' : '#721c24'}; text-align: justify;">
                                Nombre: <strong>${file.name}</strong> | Tamaño Original: ${fileSizeKB}KB | Dimensiones: ${originalWidth}x${originalHeight}px
                            </p>
                            ${status === 'no cumple' ? `
                            <div style="display: flex; align-items: center; gap: 10px; text-align: justify;">
                                <span>Descargar Ajustada</span>
                                <button class="resize-btn" data-file="${file.name}" data-src="${jpegUrl}" aria-label="Descargar">
                                    📥
                                </button>
                            </div>` : ''}
                        </li>
                    `;
    
                    if (status === 'cumple') {
                        validImages.push(listItem);
                        // Mostrar imagen cuando cumple y es una sola imagen
                        if (!isFolder && totalFiles === 1) {
                            displaySingleImage(e.target.result, null);
                        }
                    } else {
                        invalidImages.push(listItem);
                        // Mostrar imagen e información cuando no cumple y es una sola imagen
                        if (!isFolder && totalFiles === 1) {
                            displaySingleImage(jpegUrl, {
                                dimensiones: '300x400',
                                tamaño: `${transformedSizeKB} KB`,
                                formato: 'JPEG',
                            });
                        }
                    }
    
                    // Mostrar el botón "Descargar Todo" si no es carpeta y hay más de 2 imágenes que no cumplen
                    if (!isFolder && invalidImages.length >= 2) {
                        const bulkResizeContainer = document.getElementById('bulkResizeContainer');
                        bulkResizeContainer.style.display = 'block';
    
                        // Crear botón si no existe
                        let bulkResizeBtn = document.getElementById('bulkResizeBtn');
                        if (!bulkResizeBtn) {
                            bulkResizeBtn = document.createElement('button');
                            bulkResizeBtn.id = 'bulkResizeBtn';
                            bulkResizeBtn.textContent = 'Descargar Todo';
                            bulkResizeBtn.style.marginTop = '10px';
                            bulkResizeBtn.style.padding = '10px';
                            bulkResizeBtn.style.backgroundColor = '#4CAF50';
                            bulkResizeBtn.style.color = 'white';
                            bulkResizeBtn.style.border = 'none';
                            bulkResizeBtn.style.borderRadius = '5px';
                            bulkResizeBtn.style.cursor = 'pointer';
    
                            bulkResizeBtn.addEventListener('click', async function () {
                                bulkResizeBtn.disabled = true; // Deshabilitar botón
                                bulkResizeBtn.textContent = 'Procesando....'; // Cambiar texto del botón
                                bulkResizeBtn.style.cursor = 'not-allowed';
    
                                const invalidImagesData = Array.from(
                                    document.querySelectorAll('.no-cumple .resize-btn')
                                ).map((button) => ({
                                    src: button.dataset.src,
                                    fileName: button.dataset.file,
                                }));
    
                                await resizeAndDownloadAllInvalid(invalidImagesData);
    
                                bulkResizeBtn.disabled = false; // Habilitar botón
                                bulkResizeBtn.textContent = 'Descargar Todo'; // Restaurar texto del botón
                                bulkResizeBtn.style.cursor = 'pointer';
                            });
    
                            bulkResizeContainer.appendChild(bulkResizeBtn);
                        }
                    }
    
                    processedCount++;
                    if (processedCount === totalFiles) {
                        updateList(validImages, invalidImages, isFolder);
    
                        // Asegurar que el botón no se oculte si hay más de 2 imágenes que no cumplen
                        if (!isFolder && invalidImages.length >= 2) {
                            const bulkResizeContainer = document.getElementById('bulkResizeContainer');
                            bulkResizeContainer.style.display = 'block';
                        }
    
                        bindResizeButtons();
                        hideLoading();
                    }
                });
            };
    
            img.src = e.target.result;
        };
    
        reader.readAsDataURL(file);
    }
    // Función para mostrar una sola imagen
    function displaySingleImage(imageUrl, info) {
        const imageContainer = document.getElementById('imageContainer');
        imageContainer.style.display = 'flex';
        imageContainer.style.flexDirection = 'row';
        imageContainer.style.alignItems = 'center';
        imageContainer.style.justifyContent = 'center';
        imageContainer.style.gap = '20px';
        imageContainer.style.marginTop = '20px';

        const preview = document.getElementById('preview');
        preview.style.display = 'block';
        preview.style.maxWidth = '300px';
        preview.style.maxHeight = '400px';
        preview.src = imageUrl;

        // Mostrar información adicional si no cumple
        const existingInfo = document.getElementById('previewInfo');
        if (existingInfo) {
            existingInfo.remove();
        }

        if (info) {
            const infoContainer = document.createElement('div');
            infoContainer.id = 'previewInfo';
            infoContainer.style.marginLeft = '10px';
            infoContainer.style.padding = '10px';
            infoContainer.style.border = '1px solid #ccc';
            infoContainer.style.borderRadius = '5px';
            infoContainer.style.textAlign = 'justify';
            infoContainer.style.backgroundColor = '#f9f9f9';
            infoContainer.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

            infoContainer.innerHTML = `
                <div style="text-align: center;">
                    <p style="text-align: justify; margin: 5px 10px;"><strong>Dimensiones:</strong> ${info.dimensiones}</p>
                    <p style="text-align: justify; margin: 5px 10px;"><strong>Tamaño:</strong> ${info.tamaño}</p>
                    <p style="text-align: justify; margin: 5px 10px;"><strong>Formato:</strong> ${info.formato}</p>
                </div>
            `;
            //     <div style="text-align: center;">
            //     <p style="text-align: justify; margin: 5px 10px;"><strong>Dimensiones:</strong> ${info.dimensiones}</p>
            //     <p style="text-align: justify; margin: 5px 10px;"><strong>Tamaño:</strong> ${info.tamaño}</p>
            //     <p style="text-align: justify; margin: 5px 10px;"><strong>Formato:</strong> ${info.formato}</p>
            // </div>

            imageContainer.appendChild(infoContainer);
        }
    }

    // function processImage(file, validImages, invalidImages, totalFiles, isFolder) {
    //     const fileSizeKB = (file.size / 1024).toFixed(2);
    //     const fileName = file.name.toLowerCase();

    //     const reader = new FileReader();

    //     reader.onload = function (e) {
    //         const img = new Image();

    //         img.onload = function () {
    //             const originalWidth = img.width;
    //             const originalHeight = img.height;

    //             let status = 'cumple';
    //             const errors = [];

    //             if (originalWidth !== 300 || originalHeight !== 400) {
    //                 status = 'no cumple';
    //                 errors.push(`Dimensiones incorrectas (${originalWidth}x${originalHeight})`);
    //             }

    //             if (fileSizeKB > 30) {
    //                 status = 'no cumple';
    //                 errors.push(`Tamaño excede 30 KB (${fileSizeKB} KB)`);
    //             }

    //             if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
    //                 status = 'no cumple';
    //                 errors.push('Formato no compatible');
    //             }

    //             convertToJpeg(img, file.name, (jpegBlob, jpegUrl) => {
    //                 const transformedSizeKB = (jpegBlob.size / 1024).toFixed(2);

    //                 const listItem = `
    //                     <li class="${status === 'cumple' ? 'cumple' : 'no-cumple'}" style="display: flex; justify-content: space-between; align-items: left;">
    //                         <p style="color: ${status === 'cumple' ? '#155724' : '#721c24'}; text-align: justify;">
    //                             Nombre: <strong>${file.name}</strong> | Tamaño Original: ${fileSizeKB}KB | Dimensiones: ${originalWidth}x${originalHeight}px
    //                         </p>
    //                         ${status === 'no cumple' ? `
    //                         <div style="display: flex; align-items: center; gap: 10px; text-align: justify;">
    //                             <span>Descargar Ajustada</span>
    //                             <button class="resize-btn" data-file="${file.name}" data-src="${jpegUrl}" aria-label="Descargar">
    //                                 📥
    //                             </button>
    //                         </div>` : ''}
    //                     </li>
    //                 `;

    //                 if (status === 'cumple') {
    //                     validImages.push(listItem);
    //                 } else {
    //                     invalidImages.push(listItem);
    //                 }

    //                 processedCount++;
    //                 if (processedCount === totalFiles) {
    //                     updateList(validImages, invalidImages, isFolder);
    //                     bindResizeButtons(); // Enlazar eventos después de actualizar la lista
    //                     hideLoading();
    //                 }
    //             });
    //         };

    //         img.src = e.target.result;
    //     };

    //     reader.readAsDataURL(file);
    // }

    // function processImage(file, validImages, invalidImages, totalFiles, isFolder) {
    //     const fileSizeKB = (file.size / 1024).toFixed(2);
    //     const fileName = file.name.toLowerCase();

    //     const reader = new FileReader();

    //     reader.onload = function (e) {
    //         const img = new Image();

    //         img.onload = function () {
    //             const originalWidth = img.width;
    //             const originalHeight = img.height;

    //             let status = 'cumple';
    //             const errors = [];

    //             if (originalWidth !== 300 || originalHeight !== 400) {
    //                 status = 'no cumple';
    //                 errors.push(`Dimensiones incorrectas (${originalWidth}x${originalHeight})`);
    //             }

    //             if (fileSizeKB > 30) {
    //                 status = 'no cumple';
    //                 errors.push(`Tamaño excede 30 KB (${fileSizeKB} KB)`);
    //             }

    //             if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
    //                 status = 'no cumple';
    //                 errors.push('Formato no compatible');
    //             }

    //             // Convertir la imagen
    //             convertToJpeg(img, file.name, (jpegBlob, jpegUrl) => {
    //                 const transformedSizeKB = (jpegBlob.size / 1024).toFixed(2);

    //                 const listItem = `
    //                     <li class="${status === 'cumple' ? 'cumple' : 'no-cumple'}" style="display: flex; justify-content: space-between; align-items: left;">
    //                         <p style="color: ${status === 'cumple' ? '#155724' : '#721c24'}; text-align: justify;">
    //                             Nombre: <strong>${file.name}</strong> | Tamaño Original: ${fileSizeKB}KB | Dimensiones: ${originalWidth}x${originalHeight}px
    //                         </p>
    //                         ${status === 'no cumple' && isFolder ? `
    //                         <div style="display: flex; align-items: center; gap: 10px; text-align: justify;">
    //                             <span>Descargar Ajustada</span>
    //                             <button class="resize-btn" data-file="${file.name}" data-src="${jpegUrl}" aria-label="Descargar">
    //                                 📥
    //                             </button>
    //                         </div>` : ''}
    //                     </li>
    //                 `;

    //                 if (status === 'cumple') {
    //                     validImages.push(listItem);
    //                     // Mostrar solo la imagen cuando cumple y es una única imagen
    //                     if (!isFolder && totalFiles === 1) {
    //                         const imageContainer = document.getElementById('imageContainer');
    //                         imageContainer.style.display = 'flex';
    //                         imageContainer.style.justifyContent = 'center';
    //                         imageContainer.style.marginTop = '20px';

    //                         const preview = document.getElementById('preview');
    //                         preview.style.display = 'block';
    //                         preview.style.maxWidth = '300px';
    //                         preview.style.maxHeight = '400px';
    //                         preview.src = e.target.result;

    //                         // Asegurarse de que no se muestre información adicional
    //                         const existingInfo = document.getElementById('previewInfo');
    //                         if (existingInfo) {
    //                             existingInfo.remove();
    //                         }
    //                     }
    //                 } else {
    //                     invalidImages.push(listItem);
    //                     // Mostrar imagen e información cuando no cumple y es una única imagen
    //                     if (!isFolder && totalFiles === 1) {
    //                         const imageContainer = document.getElementById('imageContainer');
    //                         imageContainer.style.display = 'flex';
    //                         imageContainer.style.flexDirection = 'row';
    //                         imageContainer.style.alignItems = 'center';
    //                         imageContainer.style.justifyContent = 'center';
    //                         imageContainer.style.gap = '20px';
    //                         imageContainer.style.marginTop = '20px';

    //                         const preview = document.getElementById('preview');
    //                         preview.style.display = 'block';
    //                         preview.style.maxWidth = '300px';
    //                         preview.style.maxHeight = '400px';
    //                         preview.src = jpegUrl;

    //                         const info = document.createElement('div');
    //                         info.id = 'previewInfo';
    //                         info.style.marginLeft = '10px';
    //                         info.style.padding = '10px';
    //                         info.style.border = '1px solid #ccc';
    //                         info.style.borderRadius = '5px';
    //                         info.style.textAlign = 'justify';
    //                         info.style.backgroundColor = '#f9f9f9';
    //                         info.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    //                         info.style.display = 'block';

    //                         info.innerHTML = `
    //                             <div style="text-align: center;">
    //                                 <p style="text-align: justify; margin: 5px 10px;"><strong>Nueva Dimensión:</strong> 300x400px</p>
    //                                 <p style="text-align: justify; margin: 5px 10px;"><strong>Nuevo Tamaño:</strong> ${transformedSizeKB} KB</p>
    //                                 <p style="text-align: justify; margin: 5px 10px;"><strong>Nuevo Formato:</strong> JPEG</p>
    //                                 <button class="resize-btn" data-file="${file.name}" data-src="${jpegUrl}" aria-label="Descargar"
    //                                     style="background: none; border-radius: 5px; cursor: pointer; font-size: 18px; padding: 10px; display: inline-flex; align-items: center; gap: 8px;">
    //                                     <strong style="color: green;">DESCARGAR</strong>
    //                                     📥
    //                                 </button>
    //                             </div>
    //                         `;

    //                         // Limpiar el contenedor de información previa
    //                         const existingInfo = document.getElementById('previewInfo');
    //                         if (existingInfo) {
    //                             existingInfo.remove();
    //                         }

    //                         imageContainer.appendChild(info);
    //                     }
    //                 }

    //                 processedCount++;
    //                 if (processedCount === totalFiles) {
    //                     updateList(validImages, invalidImages, isFolder);
    //                     bindResizeButtons();
    //                     hideLoading();
    //                 }
    //             });
    //         };

    //         img.src = e.target.result;
    //     };

    //     reader.readAsDataURL(file);
    // }
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

bulkResizeBtn.addEventListener('mouseover', function () {
    bulkResizeBtn.style.backgroundColor = '#45a049'; // Cambia el color de fondo
    bulkResizeBtn.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)'; // Agrega sombra
});

bulkResizeBtn.addEventListener('mouseout', function () {
    bulkResizeBtn.style.backgroundColor = '#4CAF50'; // Restaura el color original
    bulkResizeBtn.style.boxShadow = 'none'; // Quita la sombra
});

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

        // Mostrar el botón de redimensionar y descargar todo solo si hay más de una imagen
        if (isFolder && invalidImages.length >= 2) {
            bulkResizeContainer.style.display = 'block'; // Asegurarse de que el contenedor sea visible
            if (!document.getElementById('bulkResizeBtn')) {
                const bulkResizeBtn = document.createElement('button');
                bulkResizeBtn.id = 'bulkResizeBtn';
                bulkResizeBtn.textContent = 'Descargar Todo';
                bulkResizeBtn.style.marginTop = '10px';
                bulkResizeBtn.style.padding = '10px';
                bulkResizeBtn.style.backgroundColor = '#4CAF50';
                bulkResizeBtn.style.color = 'white';
                bulkResizeBtn.style.border = 'none';
                bulkResizeBtn.style.borderRadius = '5px';
                bulkResizeBtn.style.cursor = 'pointer';

                bulkResizeBtn.addEventListener('click', async function () {
                    bulkResizeBtn.disabled = true; // Deshabilitar botón
                    bulkResizeBtn.textContent = 'Procesando....'; // Cambiar texto del botón
                    bulkResizeBtn.style.cursor = 'not-allowed';

                    const invalidImagesData = Array.from(
                        document.querySelectorAll('.no-cumple .resize-btn')
                    ).map((button) => ({
                        src: button.dataset.src,
                        fileName: button.dataset.file,
                    }));

                    await resizeAndDownloadAllInvalid(invalidImagesData);

                    bulkResizeBtn.disabled = false; // Habilitar botón
                    bulkResizeBtn.textContent = 'Descargar Todo'; // Restaurar texto del botón
                    bulkResizeBtn.style.cursor = 'pointer';
                });

                bulkResizeContainer.appendChild(bulkResizeBtn);
            }
        } else {
            bulkResizeContainer.style.display = 'none'; // Ocultar el contenedor si no se cumplen las condiciones
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
// script.js

const urlAPI = 'https://sheetdb.io/api/v1/8efdh36qypxsv';

let imagenesActuales = [];
let indiceActual = 0;

/* =========================
   CARGAR TIENDA
========================= */

async function cargarTienda() {

    try {

        const respuesta = await fetch(urlAPI);

        const productos = await respuesta.json();

        // Guardamos globalmente para filtros
        window.todosLosProductos = productos;

        // Cargar categorías en el select
        cargarCategorias(productos);

        // Render inicial
        renderProductos(productos);

    } catch (error) {

        console.error('Error cargando tienda:', error);

    }

}

/* =========================
   CARGAR CATEGORÍAS
========================= */

function cargarCategorias(productos) {

    const select =
        document.getElementById('category-filter');

    // Evita duplicados
    select.innerHTML =
        '<option value="">Categorías</option>';

    const categorias = [
        ...new Set(
            productos.map(p => p.Categoria)
        )
    ];

    categorias.sort();

    categorias.forEach(cat => {

        const option =
            document.createElement('option');

        option.value = cat;
        option.textContent = cat;

        select.appendChild(option);

    });

}

/* =========================
   RENDER PRODUCTOS
========================= */

function renderProductos(productos) {

    const mainContainer =
        document.getElementById('contenedor-categorias');

    mainContainer.innerHTML = '';

    const categoriasModuladas = {};

    productos.forEach(prod => {

        if (!categoriasModuladas[prod.Categoria]) {

            categoriasModuladas[prod.Categoria] = [];

        }

        categoriasModuladas[prod.Categoria].push(prod);

    });

    for (const nombreCat in categoriasModuladas) {

        const listaProductos =
            categoriasModuladas[nombreCat];

        const primeraImagenFondo =
            listaProductos[0].Imagen
                ? listaProductos[0]
                    .Imagen
                    .split(',')[0]
                    .trim()
                : '';

        const detalles =
            document.createElement('details');

        detalles.className = 'category-group';

        detalles.open = false;

        detalles.innerHTML = `
        
            <summary
                class="category-header"
                style="
                    background-image:
                    linear-gradient(
                        90deg,
                        #fcfcfc 40%,
                        rgba(252,252,252,0.6) 100%
                    ),
                    url('${primeraImagenFondo}');
                "
            >

                <span class="category-count">
                    ${listaProductos.length}
                </span>

                <span class="category-name">
                    ${nombreCat}
                </span>

                <i class="arrow-icon">▼</i>

            </summary>

            <div class="products-grid">

                ${listaProductos.map(p => {

                    const fotoPortada =
                        p.Imagen
                            ? p.Imagen
                                .split(',')[0]
                                .trim()
                            : '';

                    return `
                    
                        <article
                            class="product-card"
                            onclick='abrirModal(${JSON.stringify(p)})'
                        >

                            <img
                                src="${fotoPortada}"
                                alt="${p.Nombre}"
                            >

                            <div class="product-info">

                                <h3>${p.Nombre}</h3>

                                <span class="price">
                                     ${p.Precio}
                                </span>

                            </div>

                        </article>
                    
                    `;

                }).join('')}

            </div>
        
        `;

        mainContainer.appendChild(detalles);

    }

}

/* =========================
   FILTROS
========================= */

document.getElementById('search-input')
.addEventListener('input', filtrarProductos);

document.getElementById('category-filter')
.addEventListener('change', filtrarProductos);

function filtrarProductos() {

    const textoBusqueda =
        document.getElementById('search-input')
        .value
        .toLowerCase();

    const categoriaSeleccionada =
        document.getElementById('category-filter')
        .value;

    let productosFiltrados =
        window.todosLosProductos;

    // FILTRO TEXTO

    if (textoBusqueda) {

        productosFiltrados =
            productosFiltrados.filter(p => {

                return (

                    p.Nombre
                        .toLowerCase()
                        .includes(textoBusqueda)

                    ||

                    (p.Descripcion || '')
                        .toLowerCase()
                        .includes(textoBusqueda)

                );

            });

    }

    // FILTRO CATEGORÍA

    if (categoriaSeleccionada) {

        productosFiltrados =
            productosFiltrados.filter(p => {

                return (
                    p.Categoria === categoriaSeleccionada
                );

            });

    }

    renderProductos(productosFiltrados);

}

/* =========================
   ABRIR MODAL
========================= */

function abrirModal(producto) {

    imagenesActuales =
        producto.Imagen
            ? producto.Imagen
                .split(',')
                .map(img => img.trim())
            : [];

    indiceActual = 0;

    document.getElementById('modal-title')
        .innerText = producto.Nombre;

    document.getElementById('modal-price')
        .innerText =  producto.Precio;

    document.getElementById('modal-description')
        .innerText =
            producto.Descripcion
            || 'Sin descripción';

    actualizarImagenModal();

    const mensaje =
        `Hola Xkelías Crochet! Me interesa el producto: ${producto.Nombre}`;

    document.getElementById('btn-whatsapp').onclick = () => {

        window.open(
            `https://wa.me/543517884074?text=${encodeURIComponent(mensaje)}`,
            '_blank'
        );

    };

    document.getElementById('product-modal')
        .style.display = 'block';

}

/* =========================
   ACTUALIZAR IMAGEN MODAL
========================= */

function actualizarImagenModal() {

    const imgElement =
        document.getElementById('modal-img');

    imgElement.src =
        imagenesActuales[indiceActual] || '';

    const flechas =
        document.querySelectorAll('.nav-btn');

    flechas.forEach(btn => {

        btn.style.display =
            imagenesActuales.length > 1
                ? 'flex'
                : 'none';

    });

    actualizarPuntos();

}

/* =========================
   PUNTOS IMÁGENES
========================= */

function actualizarPuntos() {

    const container =
        document.getElementById('image-dots');

    container.innerHTML = '';

    if (imagenesActuales.length > 1) {

        imagenesActuales.forEach((_, i) => {

            const dot =
                document.createElement('div');

            dot.className =
                `dot ${i === indiceActual ? 'active' : ''}`;

            dot.onclick = (e) => {

                e.stopPropagation();

                indiceActual = i;

                actualizarImagenModal();

            };

            container.appendChild(dot);

        });

    }

}

/* =========================
   BOTONES GALERÍA
========================= */

document.getElementById('next-img').onclick = (e) => {

    e.stopPropagation();

    indiceActual =
        (indiceActual + 1)
        % imagenesActuales.length;

    actualizarImagenModal();

};

document.getElementById('prev-img').onclick = (e) => {

    e.stopPropagation();

    indiceActual =
        (
            indiceActual - 1
            + imagenesActuales.length
        )
        % imagenesActuales.length;

    actualizarImagenModal();

};

/* =========================
   CERRAR MODAL
========================= */

document.querySelector('.close-modal').onclick = () => {

    document.getElementById('product-modal')
        .style.display = 'none';

};

window.onclick = (event) => {

    if (
        event.target ===
        document.getElementById('product-modal')
    ) {

        document.getElementById('product-modal')
            .style.display = 'none';

    }

};

/* =========================
   ZOOM IMAGEN
========================= */

document.getElementById('modal-img').onclick =
function () {

    this.style.transform =

        this.style.transform === 'scale(1.5)'
            ? 'scale(1)'
            : 'scale(1.5)';

};

/* =========================
   INIT
========================= */

cargarTienda();

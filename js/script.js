document.addEventListener("DOMContentLoaded", function () {
    const contenedorCatalogo = document.getElementById("catalogoProductos");
    const mensajeCatalogo = document.getElementById("mensajeCatalogo");
    const campoBusqueda = document.getElementById("busquedaProducto");
    const contenedorDetalle = document.getElementById("detalleProducto");
    const mensajeDetalle = document.getElementById("mensajeDetalle");

    if (contenedorCatalogo) {
        iniciarCatalogo(contenedorCatalogo, mensajeCatalogo, campoBusqueda);
    }

    if (contenedorDetalle) {
        iniciarDetalle(contenedorDetalle, mensajeDetalle);
    }
});

let listaProductos = [];

async function iniciarCatalogo(contenedor, mensaje, campoBusqueda) {
    try {
        listaProductos = await obtenerProductos();
        mensaje.textContent = "";

        if (listaProductos.length === 0) {
            mensaje.textContent = "No hay productos disponibles.";
            return;
        }

        mostrarProductos(listaProductos, contenedor);

        campoBusqueda.addEventListener("input", function () {
            const texto = campoBusqueda.value.trim().toLowerCase();
            const productosFiltrados = listaProductos.filter(function (producto) {
                return producto.title.toLowerCase().includes(texto)
                    || producto.category.toLowerCase().includes(texto);
            });

            mostrarProductos(productosFiltrados, contenedor);

            if (productosFiltrados.length === 0) {
                mensaje.textContent = "No se encontraron productos con ese nombre o categoría.";
            } else {
                mensaje.textContent = "";
            }
        });
    } catch (error) {
        mensaje.textContent = error.message + " Revisa tu conexión e inténtalo de nuevo.";
    }
}

function mostrarProductos(productos, contenedor) {
    contenedor.replaceChildren();

    productos.forEach(function (producto) {
        const tarjeta = crearElemento("article", "tarjeta-producto");
        const imagen = crearElemento("img", "imagen-producto");
        imagen.src = producto.thumbnail || (producto.images && producto.images[0]) || "";
        imagen.alt = producto.title;
        imagen.loading = "lazy";

        imagen.addEventListener("error", function () {
            imagen.alt = "Imagen no disponible para " + producto.title;
            imagen.removeAttribute("src");
        });

        const informacion = crearElemento("div", "informacion-tarjeta");
        const categoria = crearNodoTexto("p", producto.category, "categoria");
        const nombre = crearNodoTexto("h3", producto.title, "nombre-producto");

        const filaPrecio = crearElemento("div", "fila-precio");
        const precio = crearNodoTexto("span", formatoPrecio(producto.price), "precio");
        const calificacion = crearNodoTexto("span", "★ " + valorSeguro(producto.rating), "calificacion");
        filaPrecio.append(precio, calificacion);

        const stock = crearNodoTexto("p", "Stock: " + valorSeguro(producto.stock), "stock");
        const enlace = crearElemento("a", "boton-producto");
        enlace.textContent = "Ver producto";
        enlace.href = "producto.html?id=" + encodeURIComponent(producto.id);
        enlace.setAttribute("aria-label", "Ver detalles de " + producto.title);

        informacion.append(categoria, nombre, filaPrecio, stock, enlace);
        tarjeta.append(imagen, informacion);
        contenedor.appendChild(tarjeta);
    });
}

async function iniciarDetalle(contenedor, mensaje) {
    const parametros = new URLSearchParams(window.location.search);
    const idProducto = parametros.get("id");

    if (!idProducto || !/^\d+$/.test(idProducto)) {
        mensaje.textContent = "El identificador del producto no es válido. Regresa al catálogo y selecciona un producto.";
        return;
    }

    try {
        const producto = await obtenerProductoPorId(idProducto);
        mostrarDetalle(producto, contenedor);
        mensaje.textContent = "";
    } catch (error) {
        mensaje.textContent = error.message + " Regresa al catálogo y selecciona otro producto.";
    }
}

function mostrarDetalle(producto, contenedor) {
    contenedor.replaceChildren();

    const zonaImagen = crearElemento("div", "imagen-detalle-contenedor");
    const imagen = crearElemento("img", "imagen-detalle");
    imagen.src = producto.images && producto.images.length
        ? producto.images[0]
        : producto.thumbnail || "";
    imagen.alt = producto.title;
    imagen.loading = "eager";
    zonaImagen.appendChild(imagen);

    const datos = crearElemento("div", "datos-detalle");
    const categoria = crearNodoTexto("p", producto.category, "categoria");
    const nombre = crearNodoTexto("h2", producto.title, "");
    const precio = crearNodoTexto("p", formatoPrecio(producto.price), "precio-detalle");
    const descripcion = crearNodoTexto("p", producto.description, "descripcion");

    const adicionales = crearElemento("div", "datos-adicionales");
    adicionales.append(
        crearDato("Calificación", "★ " + valorSeguro(producto.rating)),
        crearDato("Stock", valorSeguro(producto.stock)),
        crearDato("Marca", producto.brand || "No especificada"),
        crearDato("Descuento", formatoPorcentaje(producto.discountPercentage))
    );

    datos.append(categoria, nombre, precio, descripcion, adicionales);
    contenedor.append(zonaImagen, datos);
}

function crearDato(etiqueta, valor) {
    const dato = crearElemento("div", "dato");
    const textoEtiqueta = crearNodoTexto("span", etiqueta, "");
    const textoValor = crearNodoTexto("strong", valor, "");
    dato.append(textoEtiqueta, textoValor);
    return dato;
}

function crearElemento(etiqueta, clase) {
    const elemento = document.createElement(etiqueta);
    if (clase) {
        elemento.classList.add(clase);
    }
    return elemento;
}

function crearNodoTexto(etiqueta, texto, clase) {
    const nodo = crearElemento(etiqueta, clase);
    nodo.textContent = texto === null || texto === undefined ? "No disponible" : texto;
    return nodo;
}

function formatoPrecio(precio) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(precio) || 0);
}

function formatoPorcentaje(valor) {
    return (Number(valor) || 0).toFixed(2) + "%";
}

function valorSeguro(valor) {
    return valor === null || valor === undefined || valor === "" ? "No disponible" : valor;
}

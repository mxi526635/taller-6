const URL_API_PRODUCTOS = "https://dummyjson.com/products";

async function obtenerProductos() {
    const respuesta = await fetch(URL_API_PRODUCTOS);

    if (!respuesta.ok) {
        throw new Error("No se pudo consultar el catálogo.");
    }

    const datos = await respuesta.json();

    if (!datos.products || !Array.isArray(datos.products)) {
        throw new Error("La respuesta de la API no contiene una lista válida de productos.");
    }

    return datos.products;
}

async function obtenerProductoPorId(id) {
    const respuesta = await fetch(`${URL_API_PRODUCTOS}/${encodeURIComponent(id)}`);

    if (!respuesta.ok) {
        throw new Error("No se encontró un producto con ese identificador.");
    }

    return await respuesta.json();
}

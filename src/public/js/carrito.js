const comprar = async (button) => {
  const productId = button.dataset.productId;
  const userId = button.dataset.cartId;
  const quantityInput = button.previousElementSibling;
  const quantity = quantityInput.value;
  const url = `api/carts/${userId.replace(/%20/g, '"')}/product/${productId}`;
  const cleanedLink = url.replace(/\s/g, "");
 
  try {
    const response = await fetch(cleanedLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
      }),
    });
    console.log(response.ok);
    if (!response.ok) {
      throw new Error("Error al agregar el producto al carrito");
    } else {
      const data = await response.json();
      console.log(data);
      alert(data.payload);
    }
  } catch (error) {
    console.error(error);
  }
};
const finalizarCompra = async (cartId) => {
   
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    };

    try {
        const response = await fetch(`/api/carts/${cartId}/purchase`, requestOptions);

        if (!response.ok) {
            throw new Error('Error fetching purchase');
        } else {
            alert("compra realizada con exito, sera redireccionado la informacion del ticket")
            const htmlContent = await response.text();
            setTimeout(() => {
                document.open();
                document.write(htmlContent)
                document.close();
            }, 3000);
           
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}
// Llamada a la función addProductsToCart

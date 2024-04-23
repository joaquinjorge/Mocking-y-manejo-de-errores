const modificarUsuario = async (idUser) => {
  // console.log({idProducto, idCarrito})
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  console.log(idUser);

  fetch(`/api/users/premium/${idUser}`, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error changing user role");
      }

      return response.json();
    })
    .then((data) => {
      alert(`${data.message}  \n
    Nuevo Rol: ${data.newRole.toUpperCase()}`);
      console.log(data);
      window.location.reload();
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};


const eliminarUsuario = async (idUser) => {
    // console.log({idProducto, idCarrito})
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    };
    console.log(idUser);
  
    fetch(`/api/users/deleteUser/${idUser}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al eliminar user ");
        }
  
        return response.json();
      })
      .then((data) => {
        alert(data);
        console.log(data);
        window.location.reload();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

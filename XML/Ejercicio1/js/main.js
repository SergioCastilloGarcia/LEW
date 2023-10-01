class Biblioteca {
  constructor() {
    this.subfolders = [];
    this.RUTA_BOOKS ="../books";
  }

  // Método para agregar nombres de subcarpetas a la lista
  getRutasBooks() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {//TODO sacar de aqui
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = xhr.responseText;
          this.subfolders = this.extraerNombresSubcarpetas(response);
          console.log('Nombres de subcarpetas:', this.subfolders);
        } else {
          console.error('Error al obtener nombres de subcarpetas:', xhr.status);
        }
      }
    };

    xhr.open('GET', "../books/");
    xhr.send();
  }
  //Metodo para parsear la respuesta de la peticion HTTP y conseguir los nombres de las subcarpetas
  extraerNombresSubcarpetas(response) {
    // Analizar la respuesta como HTML
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(response, 'text/html');
    
    // Obtener los elementos que representan subcarpetas (por ejemplo, elementos <a>)
    const subfolderElements = htmlDoc.querySelectorAll('a');  // Ajusta el selector según la estructura de tu HTML
    
    // Extraer los nombres de las subcarpetas
    const subfolderNames = [];

    for (let i = 5; i < subfolderElements.length; i++) {//Para que no coja las carpetas hermanas
      subfolderNames.push(subfolderElements[i].textContent.trim().replace(/(\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{2}:\d{2})$/, '').trim());//Quito la fecha
    }

    return subfolderNames;
  }
}

// Crear una instancia de Biblioteca
const biblioteca = new Biblioteca();
biblioteca.getRutasBooks();
// Mostrar los nombres de subcarpetas en la consola
console.log('Nombres de subcarpetas:', biblioteca.subfolders);

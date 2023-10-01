class Biblioteca {
  constructor() {
    this.subfolders = [];
    this.nombresLibros = [];
    this.RUTA_BOOKS ="../books";
  }

  // Método para agregar nombres de subcarpetas a la lista
  getBooks() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {//TODO sacar de aqui
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = xhr.responseText;
          this.subfolders = this.getSubfoldersNames(response);//Consigo las rutas de cada libro
          this.nombresLibros=this.getBookNames();//Consigo el nombre de cada libro
          console.log(this.nombresLibros);
         
        } else {
          console.error('Error al obtener nombres de subcarpetas:', xhr.status);
        }
      }
    };

    xhr.open('GET', "../books/");
    xhr.send();
  }
  //Metodo para parsear la respuesta de la peticion HTTP y conseguir los nombres de las subcarpetas
  getSubfoldersNames(response) {
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

  //Metodo para extraer el nombre de los libros
  async getBookNames() {

    // Extraer los nombres de las subcarpetas
    const booksNames = [];
    /*for (let i = 0; i < this.subfolders.length; i++) {
      const subcarpeta = this.subfolders[i];
      const nombreLibro = this.getBookName(subcarpeta);
      booksNames.push(nombreLibro);
    }*/
    for (let i = 0; i < this.subfolders.length; i++) {
      const subcarpeta = this.subfolders[i];
      const nombreLibro = await this.obtenerNombreLibroDesdeXHTML(subcarpeta);
      if (nombreLibro) {
        booksNames.push(nombreLibro);
      }
    }
    return booksNames;

  }
  //metodo para extraer el nombre de un libro dada su ruta
  getBookName(ruta) {
    // Suponemos que el nombre del libro es igual al nombre de la carpeta (sin la extensión .epub)
    return ruta.replace('.epub', '');
  }
  async obtenerNombreLibroDesdeXHTML(subcarpeta) {
    const archivoXHTML = `../books/${subcarpeta}/OEBPS/content.opf`;

    try {
      const contenido = await this.leerArchivo(archivoXHTML);
      const nombreLibro = this.extraerNombreLibroDesdeXHTML(contenido);
      return nombreLibro;
    } catch (error) {
      console.error('Error al leer el archivo XHTML:', error);
      return null;
    }
  }


  async leerArchivo(ruta) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(`Error al leer el archivo: ${xhr.status}`);
          }
        }
      };

      xhr.open('GET', ruta);
      xhr.send();
    });
  }
  
  extraerNombreLibroDesdeXHTML(contenido) {
    // Suponemos que el nombre del libro está en una etiqueta <title>
    const parser = new DOMParser();
    const doc = parser.parseFromString(contenido, 'application/xml');
    const titleElement = doc.querySelector('title');

    if (titleElement && titleElement.textContent) {
      return titleElement.textContent.trim();
    } else {
      console.error('No se pudo encontrar el nombre del libro en el archivo XHTML.');
      return null;
    }
  }
}

// Crear una instancia de Biblioteca
const biblioteca = new Biblioteca();
biblioteca.getBooks();

class Biblioteca {
  constructor() {
    this.RUTA_BOOKS ="../books/";
    this.CONTENT_XML ='/OEBPS/content.opf';
    this.RUTA_Images ='/OEBPS/images/';
  }

  // Método para agregar nombres de subcarpetas a la lista
  async getBooks() {
    const xhr = new XMLHttpRequest();
    let subfolders = [];
    let booksBasicInfo = [];
    xhr.onreadystatechange = () => {//TODO sacar de aqui
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = xhr.responseText;
          subfolders = this.getSubfoldersNames(response);//Consigo las rutas de cada libro
          booksBasicInfo=this.getBooksBasicInfo(subfolders);//Consigo el nombre de cada libro
          console.log(booksBasicInfo);
          this.addToMain(booksBasicInfo);
        } else {
          console.error('Error al obtener nombres de subcarpetas:', xhr.status);
        }
      }
    };

    xhr.open('GET', this.RUTA_BOOKS);
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
  async getBooksBasicInfo(subfolders) {

    // Extraer los nombres de las subcarpetas
    const booksInfo = [];
    for (let i = 0; i < subfolders.length; i++) {
      const subcarpeta = subfolders[i];
      const bookInfo = await this.getBookBasicInfo(subcarpeta);
      if (bookInfo) {
        booksInfo.push(bookInfo);
      }
    }
    return booksInfo;

  }

  //metodo para extraer el nombre de un libro dada su ruta
  async getBookBasicInfo(subcarpeta) {
    const archivoXHTML = this.RUTA_BOOKS+subcarpeta+this.CONTENT_XML;

    try {
      const contenidoXML = await this.readXML(archivoXHTML);
      const nombreLibro = this.getTitle(contenidoXML);
      let portadaLibro = this.getCover(contenidoXML);
      portadaLibro=this.RUTA_BOOKS+subcarpeta+this.RUTA_Images+portadaLibro;//Construimos la ruta de la imagen de portada
      const portadaValidada=encodeURIComponent(portadaLibro);//Para que pase por el validador html
      return [nombreLibro,portadaValidada];
    } catch (error) {
      console.error('Error al leer el archivo XHTML:', error);
      return null;
    }
  }

//Metodo que carga el archivo xml en el cliente
  async readXML(ruta) {
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
  //Dado un XML consigue la portada de un libro
  getCover(contenidoXML){
    let coverName= this.getValue(contenidoXML,'meta[name="cover"]')
    if (!coverName.toLowerCase().endsWith('.jpg')) {//si no acaba en .jpg, es que es jpeg
      coverName += '.jpeg';
    }
    return coverName;//Para que valide
  }
  //Dado un XML consigue el titulo de un libro
  getTitle(contenidoXML) {
    return this.getValue(contenidoXML,'title')
  }
  //Consigue uno o más valores del xml
  getValue(contenidoXML, attribute){
    const parser = new DOMParser();
    const doc = parser.parseFromString(contenidoXML, 'application/xml');
    const valueElement = doc.querySelector(attribute);

    if (valueElement){
      if (valueElement.textContent) {//<dc:title>Holocausto Manhattan</dc:title>
        return valueElement.textContent.trim();
      } 
      else if(valueElement.getAttribute('content')){//<meta name="cover" content="cover.jpg"/>
        return valueElement.getAttribute('content').trim();
      }
    
    }
    else {
      console.error('No se pudo encontrar el valor: '+attribute);
      return null;
    }
  }
  async addToMain(booksPromise) {
    const books = await booksPromise; //Esperamos a la promesa
    const mainElement = document.querySelector('main');

    for (const book of books) {
      const article = document.createElement('article');
      const h2 = document.createElement('h2');
      const img = document.createElement('img');

      // Establecer el nombre del libro como contenido de h2
      h2.textContent = book[0];

      // Establecer la ruta de la imagen como fuente de la etiqueta img
      img.src = book[1];
      img.alt = "Portada de "+book[0];
      // Agregar h2 e img al artículo
      article.appendChild(h2);
      article.appendChild(img);

      // Agregar el artículo al elemento main
      mainElement.appendChild(article);
    }
  }
}

// Crear una instancia de Biblioteca
const biblioteca = new Biblioteca();
biblioteca.getBooks();

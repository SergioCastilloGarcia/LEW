class Biblioteca {
  constructor() {
    this.subfolders = [];
    this.booksBasicInfo = [];
    this.RUTA_BOOKS ="../books/";
    this.CONTENT_XML ='/OEBPS/content.opf';
    this.RUTA_Images ='/OEBPS/images/';
  }

  // Método para agregar nombres de subcarpetas a la lista
  getBooks() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {//TODO sacar de aqui
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = xhr.responseText;
          this.subfolders = this.getSubfoldersNames(response);//Consigo las rutas de cada libro
          this.booksBasicInfo=this.getBooksBasicInfo();//Consigo el nombre de cada libro
          console.log(this.booksBasicInfo);
         
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
  async getBooksBasicInfo() {

    // Extraer los nombres de las subcarpetas
    const booksInfo = [];
    for (let i = 0; i < this.subfolders.length; i++) {
      const subcarpeta = this.subfolders[i];
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
      return [nombreLibro,portadaLibro];
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
  getCover(contenidoXML){
    let coverName= this.getValue(contenidoXML,'meta[name="cover"]')
    if (!coverName.toLowerCase().endsWith('.jpg')) {//si no acaba en .jpg, es que es jpeg
      coverName += '.jpeg';
    }
    return coverName;
  }
  //Dado un XML onsigue el titulo de un libro
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
}

// Crear una instancia de Biblioteca
const biblioteca = new Biblioteca();
biblioteca.getBooks();

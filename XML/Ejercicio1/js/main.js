class Biblioteca {
  
  constructor() {
    this.RUTA_BOOKS ="../books/";
    this.CONTENT_XML ='/OEBPS/content.opf';
    this.TOC_XML ='/OEBPS/toc.ncx';
    this.RUTA_IMAGES ='/OEBPS/images/';
    this.RUTA_OEBPS ='/OEBPS/';
  }

  // Método para agregar nombres de subcarpetas a la lista
  async getBooks() {
    //Si ya hay contenido lo borra
    try{
      const mainElement = document.querySelector('main');
      mainElement.innerHTML = '';  // Borra todo el contenido dentro de <main>
      
    }catch(e){}
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => this.getBooksOnReadyStateChange(xhr);
    xhr.open('GET', this.RUTA_BOOKS);
    xhr.send();
  }
  //Metodo que encapsula el metodo OnReadyStateChange de la XMLHttpRequest
  getBooksOnReadyStateChange(xhr){
    let subfolders = [];
    let booksBasicInfo = [];
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const response = xhr.responseText;
        subfolders = this.getSubfoldersNames(response);//Consigo las rutas de cada libro
        booksBasicInfo=this.getBooksBasicInfo(subfolders);//Consigo el nombre de cada libro
        this.addBooksToIndex(booksBasicInfo);
      } else {
        console.error('Error al obtener nombres de subcarpetas:', xhr.status);
      }
    }
  };
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
      portadaLibro=this.RUTA_BOOKS+subcarpeta+this.RUTA_IMAGES+portadaLibro;//Construimos la ruta de la imagen de portada
      const portadaValidada=encodeURIComponent(portadaLibro);//Para que pase por el validador html

      return {
        ruta: this.RUTA_BOOKS + subcarpeta,
        title: nombreLibro,
        cover: portadaValidada
      };
    } catch (error) {
      console.error('Error al leer el archivo XML:', error);
      return null;
    }
  }
   //metodo para extraer datos extra de un libro dada su ruta
   async getBookExtraInfo(subcarpeta) {
    const archivoXHTML = this.RUTA_BOOKS+subcarpeta+this.CONTENT_XML;

    try {
      const contenidoXML = await this.readXML(archivoXHTML);

      const author = this.getAuthor(contenidoXML);
      const description = this.getDescription(contenidoXML);
      const date = this.getDate(contenidoXML);
      const publisher = this.getPublisher(contenidoXML);
      const subject = this.getSubject(contenidoXML);

      return {
        author: author,
        description: description,
        date: date,
        publisher: publisher,
        subject: subject,
      };
    } catch (error) {
      console.error('Error al leer el archivo XML:', error);
      return null;
    }
  }
  //metodo para extraer datos extra de un libro dada su ruta
  async getBookChapters(subcarpeta) {
    const archivoXHTML = this.RUTA_BOOKS+subcarpeta+this.TOC_XML;

    try {
      const contenidoXML = await this.readXML(archivoXHTML);

      const chapters = this.getChapters(contenidoXML);

      return chapters;
    } catch (error) {
      console.error('Error al leer el archivo XML:', error);
      return null;
    }
  }
  //Consigue datos de un libro concreto
  async getBook(folder){
    const mainElement = document.querySelector('main');
    mainElement.innerHTML = '';  // Borra todo el contenido dentro de <main>
    const bookBasicInfo = await this.getBookBasicInfo(folder);
    const bookExtraInfo = await this.getBookExtraInfo(folder);
    const chapters = await this.getBookChapters(folder);
    this.addBookToIndex(bookBasicInfo,bookExtraInfo, chapters);
  }

//Metodo que carga el archivo xml en el cliente
  async readXML(ruta) {
    return new Promise((resolve, reject) => this.readXMLPromise(ruta,resolve,reject)); 
  }
  //Metodo que encapsula el metodo de la promise
  readXMLPromise(ruta,resolve,reject){
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => this.readXMLOnReadyStateChange(xhr,resolve,reject);

    xhr.open('GET', ruta);
    xhr.send();
  }
  //Metodo que encapsula el metodo OnReadyStateChange de la XMLHttpRequest
  readXMLOnReadyStateChange(xhr,resolve,reject){
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(`Error al leer el archivo: ${xhr.status}`);
      }
    }
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
  //Dado un XML consigue el autor de un libro
  getAuthor(contenidoXML) {
    return this.getValue(contenidoXML,'creator')
  }
  //Dado un XML consigue la descripcion de un libro
  getDescription(contenidoXML) {
    return this.getValue(contenidoXML,'description')
  }
  //Dado un XML consigue la fecha de un libro
  getDate(contenidoXML) {
    return this.getValue(contenidoXML,'date')
  }
  //Dado un XML consigue la editorial de un libro
  getPublisher(contenidoXML) {
    return this.getValue(contenidoXML,'publisher')
  }
   //Dado un XML consigue las categorias de un libro
   getSubject(contenidoXML) {
    return this.getValue(contenidoXML,'subject')
  }
  //Dado un xml consigue los ids de los capitulos
  getChapters(contenidoXML){
    const parser = new DOMParser();
    const doc = parser.parseFromString(contenidoXML, 'application/xml');
    const navPoints = doc.querySelectorAll('navPoint');
    const chapters = [];
    if (navPoints && navPoints.length>0){
      for (let i = 0; i < navPoints.length; i++) {
        const navPoint = navPoints[i];
        const textValue = navPoint.querySelector('text').textContent;
        const contentSrcValue = navPoint.querySelector('content').getAttribute('src');
        
        chapters.push({ text: textValue, contentSrc: contentSrcValue });
      }
      return chapters
    }else {
      console.error('No se pudo encontrar los capitulos');
      return null;
    }
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
  async addBooksToIndex(booksPromise) {
    const books = await booksPromise; //Esperamos a la promesa
    const mainElement = document.querySelector('main');

    for (const book of books) {
      const article = document.createElement('article');
      const h2 = document.createElement('h2');
      const img = document.createElement('img');
      const boton = document.createElement('button');

      // Establecer el nombre del libro como contenido de h2
      h2.textContent = book.title;

      // Establecer la ruta de la imagen como fuente de la etiqueta img
      img.src = book.cover;
      img.alt = "Portada de "+book.title;

      //Configura el boton de ver mas
      boton.textContent = 'Ver más';
      boton.onclick = () => this.getBook(book.ruta);

      // Agregar h2 e img al artículo
      article.appendChild(img);
      article.appendChild(h2);
      article.appendChild(boton);

      // Agregar el artículo al elemento main
      mainElement.appendChild(article);
    }
  }
  async addBookToIndex(bookBasicInfo, bookExtraInfo,chapters) {
    const mainElement = document.querySelector('main');

    const h2 = document.createElement('h2');
    const img = document.createElement('img');
    const section = document.createElement('section');
    const article = document.createElement('article');
    const descripcion = document.createElement('p');
    const author = document.createElement('p');
    const date = document.createElement('p');
    const publisher = document.createElement('p');
    const subject = document.createElement('p');
    const nav = document.createElement('nav');

    // Establecer el nombre del libro como contenido de h2
    h2.textContent = bookBasicInfo.title;

    // Establecer la ruta de la imagen como fuente de la etiqueta img
    img.src = bookBasicInfo.cover;
    img.alt = "Portada de "+bookBasicInfo.title;

    // Agregar h2 e img al artículo
    section.appendChild(h2);
    section.appendChild(img);

    //Agrega los campos extra
    if(author){
      const authorTitle = document.createElement('h3');
      authorTitle.textContent="Autor: ";
      article.appendChild(authorTitle);

      author.innerHTML=bookExtraInfo.author;
      article.appendChild(author);
    }
    if(date){
      const dateTitle = document.createElement('h3');
      dateTitle.textContent="Fecha: ";
      article.appendChild(dateTitle);
      date.innerHTML=bookExtraInfo.date;
      article.appendChild(date);
    }if(publisher){
      const publisherTitle = document.createElement('h3');
      publisherTitle.textContent="Editorial: ";
      article.appendChild(publisherTitle);
      publisher.innerHTML=bookExtraInfo.publisher;
      article.appendChild(publisher);
    }if(subject){
      const subjectTitle = document.createElement('h3');
      subjectTitle.textContent="Categoría: ";
      article.appendChild(subjectTitle);
      subject.innerHTML=bookExtraInfo.subject;
      article.appendChild(subject);
    }if(descripcion){
      const descripcionTitle = document.createElement('h3');
      descripcionTitle.textContent="Sinopsis: ";
      article.appendChild(descripcionTitle);
      descripcion.innerHTML=bookExtraInfo.description;
      article.appendChild(descripcion);
    }
    section.appendChild(article);
    if(chapters){
      const h4 = document.createElement('h4');
      h4.textContent="Capítulos: ";
      section.appendChild(h4);
      for (let i = 0; i < chapters.length; i++) {
        const a = document.createElement('a');
        const chapterTitle=chapters[i].text;
        a.textContent=chapterTitle;
        const ruta=bookBasicInfo.ruta.substring(9)+this.RUTA_OEBPS+chapters[i].contentSrc
        a.href=encodeURIComponent(ruta);
        a.target="_blank"; //Lo abre en una pestaña nueva
        nav.appendChild(a);
      }
      section.appendChild(nav);
    }
    mainElement.appendChild(section);

    
  }
}

// Crear una instancia de Biblioteca
const biblioteca = new Biblioteca();
biblioteca.getBooks();

class ConertidorXML {

  constructor() {
    this.xmlContent;
  }

  handleFile(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        this.xmlContent = event.target.result;
      };

      reader.readAsText(file);
    } else {
      alert('Selecciona un archivo XML antes de subirlo.');
    }
  }

  parseXML() {
    if (this.xmlContent) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(this.xmlContent, 'application/xml');
      console.log('Contenido del XML:', xmlDoc);
      this.makeHTML(xmlDoc);
    } else {
      alert('Primero selecciona un archivo XML.');
    }
  }

  makeHTML() {
    const nombre = this.getNombre();
    const nombreEstadio = this.getNombreEstadio();


    this.downloadHtmlCopy();
  }
  //Dado un XML consigue el nombre de un equipo
  getNombre() {
    return this.getValue('nombre')
  }
  //Dado un XML consigue el nombre de un equipo
  getNombreEstadio() {
    return this.getValue('nombreEstadio')
  }
  //Consigue uno o más valores del xml
  getValue(attribute) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.xmlContent, 'text/xml');
    // Buscar el valor del atributo en la etiqueta 'equipo'
    const value = xmlDoc.getElementsByTagName(attribute)[0].textContent;

    if (value) {
      return value;
    }
    else {
      console.error('No se pudo encontrar el valor: ' + attribute);
      return null;
    }
  }
  downloadHtmlCopy() {
    const url = '../html/plantilla.html';

    // Realizar una solicitud para obtener el contenido del archivo
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onload = function () {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'text/xml' });

        // Crear un enlace para descargar el archivo
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'plantilla.html';

        // Agregar el enlace al documento y simular un clic
        document.body.appendChild(a);
        a.click();

        // Limpiar y remover el enlace del documento
        document.body.removeChild(a);
      }
    };

    xhr.send();
  }

}

// Crear una instancia de ConertidorXML
const conertidorXML = new ConertidorXML();

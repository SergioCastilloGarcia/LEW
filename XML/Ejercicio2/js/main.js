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

      // Aquí puedes trabajar con el documento XML (xmlDoc)
      // Por ejemplo, puedes acceder a los elementos usando xmlDoc.querySelector('nombre_del_elemento')

      console.log('Contenido del XML:', xmlDoc);
    } else {
      alert('Primero selecciona un archivo XML.');
    }
  }

  //Dado un XML consigue la editorial de un libro
  getPublisher(contenidoXML) {
    return this.getValue(contenidoXML, 'publisher')
  }

  //Consigue uno o más valores del xml
  getValue(contenidoXML, attribute) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contenidoXML, 'application/xml');
    const valueElement = doc.querySelector(attribute);

    if (valueElement) {
      if (valueElement.textContent) {//<dc:title>Holocausto Manhattan</dc:title>
        return valueElement.textContent.trim();
      }
      else if (valueElement.getAttribute('content')) {//<meta name="cover" content="cover.jpg"/>
        return valueElement.getAttribute('content').trim();
      }

    }
    else {
      console.error('No se pudo encontrar el valor: ' + attribute);
      return null;
    }
  }

}

// Crear una instancia de ConertidorXML
const conertidorXML = new ConertidorXML();

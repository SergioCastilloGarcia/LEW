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
    console.log(nombre);
    console.log(nombreEstadio);
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

}

// Crear una instancia de ConertidorXML
const conertidorXML = new ConertidorXML();

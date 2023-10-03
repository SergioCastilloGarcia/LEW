class ConertidorXML {

  constructor() {
    this.xmlContent;
    this.plantillaHTML = '../html/plantilla.html';
    this.plantillaCSS = '../css/plantilla.css';
    this.team;
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

  async parseXML() {
    if (this.xmlContent) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(this.xmlContent, 'application/xml');

      await this.makeTeam()
      this.downloadPlantilla();
    } else {
      alert('Primero selecciona un archivo XML.');
    }
  }


  makeTeam() {
    const nombre = this.getNombre();
    const nombreEstadio = this.getNombreEstadio();

    this.team = {
      nombre: nombre,
      nombreEstadio: nombreEstadio
    };
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


  downloadPlantilla() {
    this.downloadHtml();
    this.downloadCss();
  }
  downloadHtml() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.plantillaHTML, true);
    xhr.responseType = 'blob';

    xhr.onload = () => this.htmlOnLoad(xhr);

    xhr.send();
  }

  downloadCss() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.plantillaCSS, true);
    xhr.responseType = 'blob';

    xhr.onload = () => this.cssOnLoad(xhr);

    xhr.send();
  }
  htmlOnLoad(xhr) {
    if (xhr.status === 200) {
      const reader = new FileReader();
      reader.onload = () => this.htmlConfigurator(this.modifyHtml(reader.result));
      reader.readAsText(xhr.response, 'utf-8');
    }
  }
  cssOnLoad(xhr) {
    if (xhr.status === 200) {
      const reader = new FileReader();
      reader.onload = () => this.cssConfigurator(this.modifyCss(reader.result));
      reader.readAsText(xhr.response, 'utf-8');
    }
  }
  htmlConfigurator(htmlContent) {
    const blob = new Blob([htmlContent], { type: 'text/html' });

    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = this.team.nombre;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

  }
  cssConfigurator(cssContent) {
    const blob = new Blob([cssContent], { type: 'text/css' });

    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = this.team.nombre;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

  }
  modifyHtml(htmlContent) {
    let modifiedHtml = htmlContent.replaceAll('{nombre}', this.team.nombre);
    modifiedHtml = modifiedHtml.replaceAll('{nombrecss}', encodeURIComponent(this.team.nombre));
    return modifiedHtml;
  }
  modifyCss(cssContent) {
    return cssContent;
  }
}

// Crear una instancia de ConertidorXML
const conertidorXML = new ConertidorXML();

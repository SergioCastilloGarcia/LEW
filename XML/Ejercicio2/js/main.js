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
    const pais = this.getPais();
    const ciudad = this.getCiudad();
    const fundacion = this.getFundacion();
    const eslogan = this.getEslogan();
    const escudo = this.getEscudo();
    const portada = this.getPortada();
    const colorPrimario = this.getColorPrimario();
    const colorSecundario = this.getColorSecundario();
    const nombreEstadio = this.getNombreEstadio();
    const capacidad = this.getCapacidadEstadio();
    const localizacion = this.getLocalizacionEstadio();
    const fotoEstadio = this.getFotoEstadio();
    const jugadores = this.getJugadores();
    const redesSociales = this.getRedesSociales();

    this.team = {
      nombre: nombre,
      pais: pais,
      ciudad: ciudad,
      fundacion: fundacion,
      eslogan: eslogan,
      escudo: escudo,
      portada: portada,
      colorPrimario: colorPrimario,
      colorSecundario: colorSecundario,
      nombreEstadio: nombreEstadio,
      capacidad: capacidad,
      localizacion: localizacion,
      fotoEstadio: fotoEstadio,
      jugadores: jugadores,
      redesSociales: redesSociales
    };
  }
  //Dado un XML consigue el nombre de un equipo
  getNombre() {
    return this.getValue('nombre');
  }
  //Dado un XML consigue el nombre del pais de un equipo
  getPais() {
    return this.getValue('pais');
  }
  //Dado un XML consigue el nombre de la ciudad de un equipo
  getCiudad() {
    return this.getValue('ciudad');
  }
  //Dado un XML consigue la fundación de un equipo
  getFundacion() {
    return this.getValue('fundacion');
  }
  //Dado un XML consigue el eslogan de un equipo
  getEslogan() {
    return this.getValue('eslogan');
  }
  //Dado un XML consigue el escudo de un equipo
  getEscudo() {
    return this.getValue('escudo');
  }
  //Dado un XML consigue la portada de un equipo
  getPortada() {
    return this.getValue('portada');
  }
  //Dado un XML consigue el colorPrimario de un equipo
  getColorPrimario() {
    return this.getValue('colorPrimario');
  }
  //Dado un XML consigue el colorPrimario de un equipo
  getColorSecundario() {
    return this.getValue('colorSecundario');
  }
  //Dado un XML consigue el nombre del estadio de un equipo
  getNombreEstadio() {
    return this.getValue('nombreEstadio');
  }
  //Dado un XML consigue la localizacion del estadio de un equipo
  getLocalizacionEstadio() {
    return this.getValue('localizacion');
  }
  //Dado un XML consigue la capacidad del estadio de un equipo
  getFotoEstadio() {
    return this.getValue('fotoEstadio');
  }
  //Dado un XML consigue la foto del estadio de un equipo
  getCapacidadEstadio() {
    return this.getValue('capacidad');
  }
  //Dado un XML consigue los jugafores de un equipo
  getJugadores() {
    let jugadoresArray = this.getValue('jugadores').replace(/\n/g, ' ').split(' ').filter(word => word !== '');
    const jugadores = [];

    for (let i = 0; i < jugadoresArray.length; i += 3) {
      const nombre = jugadoresArray[i];
      const posicion = jugadoresArray[i + 1];
      const edad = jugadoresArray[i + 2];
      jugadores.push({ nombre, posicion, edad });
    }
    return jugadores;
  }
  //Dado un XML consigue las redes sociales de un equipo
  getRedesSociales() {
    let redesSocialesArray = this.getValue('redesSociales').replace(/\n/g, ' ').split(' ').filter(word => word !== '');
    const redesSociales = [];

    for (let i = 0; i < redesSocialesArray.length; i += 2) {
      const nombre = redesSocialesArray[i];
      const enlace = redesSocialesArray[i + 1];
      redesSociales.push({ nombre, enlace });
    }
    return redesSociales;
  }
  //Consigue uno valor del xml
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
    modifiedHtml = modifiedHtml.replaceAll('{pais}', this.team.pais);
    modifiedHtml = modifiedHtml.replaceAll('{ciudad}', this.team.ciudad);
    modifiedHtml = modifiedHtml.replaceAll('{fundacion}', this.team.fundacion);
    modifiedHtml = modifiedHtml.replaceAll('{eslogan}', this.team.eslogan);
    modifiedHtml = modifiedHtml.replaceAll('{escudo}', this.team.escudo);
    modifiedHtml = modifiedHtml.replaceAll('{portada}', this.team.portada);
    modifiedHtml = modifiedHtml.replaceAll('{nombreEstadio}', this.team.nombreEstadio);
    modifiedHtml = modifiedHtml.replaceAll('{capacidad}', this.team.capacidad);
    modifiedHtml = modifiedHtml.replaceAll('{localizacion}', this.team.localizacion);
    modifiedHtml = modifiedHtml.replaceAll('{fotoEstadio}', this.team.fotoEstadio);

    const parser = new DOMParser();
    const doc = parser.parseFromString(modifiedHtml, 'text/html');

    const table = doc.querySelector('tbody');
    for (let i = 0; i < this.team.redesSociales.length; i += 1) {
      const tr = document.createElement('tr');
      const name = document.createElement('td');
      const edad = document.createElement('td');
      const posicion = document.createElement('td');
      name.textContent = this.team.jugadores[i].nombre;
      edad.textContent = this.team.jugadores[i].edad;
      posicion.textContent = this.team.jugadores[i].posicion;
      tr.appendChild(name);
      tr.appendChild(edad);
      tr.appendChild(posicion);
      table.appendChild(tr);
    }
    const footer = doc.querySelector('footer');
    for (let i = 0; i < this.team.redesSociales.length; i += 1) {
      const a = document.createElement('a');
      a.textContent = this.team.redesSociales[i].nombre;
      a.href = this.team.redesSociales[i].enlace;
      footer.appendChild(a);
    }
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }
  modifyCss(cssContent) {
    let modifiedCss = cssContent.replaceAll('#colorPrimario', this.team.colorPrimario);
    modifiedCss = modifiedCss.replaceAll('#colorSecundario', this.team.colorSecundario);
    return modifiedCss;
  }
}

// Crear una instancia de ConertidorXML
const conertidorXML = new ConertidorXML();

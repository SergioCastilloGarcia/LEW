document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.querySelector("input[type='file']");
    const loadButton = document.querySelector("button");
    const viewer = document.querySelector("section");
    let book;
  
    const unzip = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
      
          reader.onload = () => {
            const arrayBuffer = reader.result;
            const zip = new window.JSZip();
      
            zip.loadAsync(arrayBuffer).then((unzipped) => {
              resolve(unzipped);
            }).catch((error) => {
              reject(error);
            });
          };
      
          reader.readAsArrayBuffer(file);
        });
      };

      const parseEPUB = (unzipped) => {
        // Accede a los archivos dentro del ePub
        const content = unzipped.files;
      
        // Ejemplo: Obtener el contenido del archivo de metadatos
        content['META-INF/container.xml'].async('string').then((metadata) => {
          // Aquí deberías escribir la lógica para extraer el título y otra información relevante
          console.log("Metadatos:", metadata);
        }).catch((error) => {
          console.error("Error al acceder a los metadatos:", error);
        });
      };

      const loadEPUB = () => {
        const file = fileInput.files[0];
        if (file) {
          unzip(file)
            .then((unzipped) => {
              parseEPUB(unzipped);
            })
            .catch((error) => {
              console.error("Error al descomprimir el archivo ePub:", error);
            });
        }
      };
      
    
      loadButton.addEventListener("click", loadEPUB);
    });
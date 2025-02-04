function renderInitialScale(containerToInsert, sizeObj) {
    const isInitialScaleExists = document.getElementById("initialScale");
    const isInitialSizeExists = document.getElementById("initialSize");
  
    if (isInitialScaleExists) isInitialScaleExists.remove();
    if (isInitialSizeExists) isInitialSizeExists.remove();
  
    const initialScale = document.createElement("div");
    initialScale.id = "initialScale";
    initialScale.style.backgroundColor = "green";
    initialScale.style.height = "10px";
    initialScale.style.width = "100%";
  
    const initialSize = document.createElement("div");
    initialSize.id = "initialSize";
    initialSize.style.fontWeight = "bold";
    initialSize.style.textAlign = "center";
    initialSize.innerHTML = sizeObj.originalSize + " kb";
  
    containerToInsert.append(initialScale);
    containerToInsert.append(initialSize);
  }

  function renderCompressionScale(
    containerToInsert,
    initialSize,
    compressionSize,
    compressScaleId,
    comressSizeId
  ) {
    try {
      const isGzipScaleExists = document.getElementById(compressScaleId);
      const isGzipSizeExists = document.getElementById(comressSizeId);
      const isWrapperExists = document.getElementById("wrapper");
    
      if (isGzipScaleExists) isGzipScaleExists.remove();
      if (isGzipSizeExists) isGzipSizeExists.remove();
      // if (isWrapperExists) isWrapperExists.remove();
    
      let compressedScaleWidth =
        Number(compressionSize * 100) / Number(initialSize);

      if (compressedScaleWidth > 100) compressedScaleWidth = 100;

     if(!isWrapperExists){
      var wrapper = document.createElement("div");
      wrapper.id = "wrapper";
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.justifyContent = "center";
      wrapper.style.marginLeft = "10px";
      wrapper.style.marginRight = "10px";
      wrapper.style.width = "100%";
      wrapper.style.height = "60px";
     } 

      const compressedScale = document.createElement("div");
      compressedScale.id = compressScaleId;
      compressedScale.style.backgroundColor = "green";
      compressedScale.style.height = "10px";
      compressedScale.style.width = `${compressedScaleWidth}%`;
    
      const compressedSize = document.createElement("div");
      compressedSize.id = comressSizeId;
      compressedSize.style.fontWeight = "bold";
      compressedSize.style.textAlign = "center";
      compressedSize.innerHTML = Math.round(compressionSize/100)  + " kb";
    

      if(!isWrapperExists){
        wrapper.append(compressedScale);
        wrapper.append(compressedSize);
        containerToInsert.append(wrapper);
      } else {
        isWrapperExists.append(compressedScale);
        isWrapperExists.append(compressedSize);
      }
    } catch (error) {
      console.log("error catched renderCompressionScale", error);
    }

  }

  export {renderInitialScale, renderCompressionScale};
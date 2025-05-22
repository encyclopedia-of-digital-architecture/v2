document.addEventListener("DOMContentLoaded", function() {
    // Butonlar ve içerik konteynerleri
    const sunburstButton = document.getElementById("toggleButton-1a");
    const circlePackingButton = document.getElementById("toggleButton-1b");
    const sequencesSunburstButton = document.getElementById("toggleButton-1c");
    const prototypeButton = document.getElementById("toggleButton-1a2");
    
    const hierarchicalEdgeBundlingButton = document.getElementById("toggleButton-2a"); // Yeni buton
    const radialTreeButton = document.getElementById("toggleButton-2b"); // Yeni buton
    const tidyTreeButton = document.getElementById("toggleButton-2c"); // Yeni buton
  
    const sunburstChart = document.getElementById("zoomableSunburstContainer");
    const circlePackingChart = document.getElementById("zoomableCirclePackingContainer");
    const sequencesSunburstChart = document.getElementById("sequencesSunburstContainer");
    const iframeWrapper = document.querySelector(".iframe-container-wrapper");
  
    // Yeni içerik konteynerleri
    const hierarchicalEdgeBundlingContainer = document.getElementById("hierarchicalEdgeBundlingContainer");
    const radialTreeContainer = document.getElementById("radialTreeContainer");
    const tidyTreeContainer = document.getElementById("tidyTreeContainer");
  
    // Butonlara tıklama olaylarını ekleyelim
    sunburstButton.addEventListener("click", function() {
        toggleZoomableSunburst();
    });
  
    circlePackingButton.addEventListener("click", function() {
        toggleZoomableCirclePacking();
    });
  
    sequencesSunburstButton.addEventListener("click", function() {
        toggleZoomableSunburstSequences();
    });
  
    prototypeButton.addEventListener("click", function() {
        togglePrototypeIframe();
    });
  
    // Yeni butonlara tıklama olaylarını ekleyelim
    hierarchicalEdgeBundlingButton.addEventListener("click", function() {
        toggleHierarchicalEdgeBundling();
    });
  
    radialTreeButton.addEventListener("click", function() {
        toggleRadialTree();
    });
  
    tidyTreeButton.addEventListener("click", function() {
        toggleTidyTree();
    });
  
    // Butonlardan aktif durumu kaldır
    function removeActiveClasses() {
        sunburstButton.classList.remove("active");
        circlePackingButton.classList.remove("active");
        sequencesSunburstButton.classList.remove("active");
        prototypeButton.classList.remove("active");
        hierarchicalEdgeBundlingButton.classList.remove("active");
        radialTreeButton.classList.remove("active");
        tidyTreeButton.classList.remove("active");
    }
  
    // Sunburst grafiğini aktif hale getir ve diğerlerini gizle
    function toggleZoomableSunburst() {
        removeActiveClasses();
        sunburstButton.classList.add("active");
  
        sunburstChart.style.display = "block";
        circlePackingChart.style.display = "none";
        sequencesSunburstChart.style.display = "none";
        iframeWrapper.style.display = "none";
        hierarchicalEdgeBundlingContainer.style.display = "none";
        radialTreeContainer.style.display = "none";
        tidyTreeContainer.style.display = "none";
  
        loadScript("zoomableSunburst.js");
    }
  
    // Circle Packing grafiğini aktif hale getir ve diğerlerini gizle
    function toggleZoomableCirclePacking() {
        removeActiveClasses();
        circlePackingButton.classList.add("active");
  
        circlePackingChart.style.display = "block";
        sunburstChart.style.display = "none";
        sequencesSunburstChart.style.display = "none";
        iframeWrapper.style.display = "none";
        hierarchicalEdgeBundlingContainer.style.display = "none";
        radialTreeContainer.style.display = "none";
        tidyTreeContainer.style.display = "none";
  
        loadScript("zoomableCirclePacking.js");
    }
  
    // Sequences Sunburst grafiğini aktif hale getir ve diğerlerini gizle
    function toggleZoomableSunburstSequences() {
        removeActiveClasses();
        sequencesSunburstButton.classList.add("active");
  
        sequencesSunburstChart.style.display = "block";
        sunburstChart.style.display = "none";
        circlePackingChart.style.display = "none";
        iframeWrapper.style.display = "none";
        hierarchicalEdgeBundlingContainer.style.display = "none";
        radialTreeContainer.style.display = "none";
        tidyTreeContainer.style.display = "none";
  
        loadScript("zoomableSunburstSequences.js");
    }
  
    // Prototip sayfasını iframe'e yüklemek için fonksiyon
    function togglePrototypeIframe() {
        removeActiveClasses(); // Diğer butonların aktifliğini kaldır
        prototypeButton.classList.add("active");
  
        // iframe'i aç ve Prototype içeriğini yükle
        const iframe = document.createElement('iframe');
        iframe.src = "prototype/prototype.html"; // Prototip sayfasını yükle
        iframe.title = "Zoomable Sunburst Prototype";
  
        // iframe container'ına ekle
        iframeWrapper.innerHTML = "";  // Eski içeriği temizle
        iframeWrapper.appendChild(iframe);
        iframeWrapper.style.display = "block"; // iframe kısmını göster
  
        // Diğer içerikleri gizle
        sunburstChart.style.display = "none";
        circlePackingChart.style.display = "none";
        sequencesSunburstChart.style.display = "none";
        hierarchicalEdgeBundlingContainer.style.display = "none";
        radialTreeContainer.style.display = "none";
        tidyTreeContainer.style.display = "none";
    }
  
    // Yeni içerikler için fonksiyonlar
    function toggleHierarchicalEdgeBundling() {
        removeActiveClasses();
        hierarchicalEdgeBundlingButton.classList.add("active");
  
        hierarchicalEdgeBundlingContainer.style.display = "block";
        sunburstChart.style.display = "none";
        circlePackingChart.style.display = "none";
        sequencesSunburstChart.style.display = "none";
        iframeWrapper.style.display = "none";
        radialTreeContainer.style.display = "none";
        tidyTreeContainer.style.display = "none";
  
        loadScript("hierarchicalEdgeBundling.js");
    }
  
    function toggleRadialTree() {
        removeActiveClasses();
        radialTreeButton.classList.add("active");
  
        radialTreeContainer.style.display = "block";
        sunburstChart.style.display = "none";
        circlePackingChart.style.display = "none";
        sequencesSunburstChart.style.display = "none";
        iframeWrapper.style.display = "none";
        hierarchicalEdgeBundlingContainer.style.display = "none";
        tidyTreeContainer.style.display = "none";
  
        loadScript("radialTree.js");
    }
  
    function toggleTidyTree() {
        removeActiveClasses();
        tidyTreeButton.classList.add("active");
  
        tidyTreeContainer.style.display = "block";
        sunburstChart.style.display = "none";
        circlePackingChart.style.display = "none";
        sequencesSunburstChart.style.display = "none";
        iframeWrapper.style.display = "none";
        hierarchicalEdgeBundlingContainer.style.display = "none";
        radialTreeContainer.style.display = "none";
  
        loadScript("tidyTree.js");
    }
  
    // Script yükleme fonksiyonu
    function loadScript(src) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = function() {
            console.log(src + " yükleme tamamlandı");
        };
        document.head.appendChild(script);
    }
  });
  
  document.addEventListener("DOMContentLoaded", function () {
      const buttons = document.querySelectorAll(".open-tab-btn");
  
      buttons.forEach(button => {
        button.addEventListener("click", function () {
          const url = this.getAttribute("data-url");
          window.open(url, '_blank'); // Yeni sekmede aç
        });
      });
  });
  
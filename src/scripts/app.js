import {
    showPopup,
    hidePopup,
} from "../helpers/helper.js";


window.addEventListener("load", () => {
    const loaderElem = document.getElementById("loader")
    setTimeout(() => {
        loaderElem.classList.remove("flex")
        loaderElem.classList.add("hidden")
    }, 500); 
    // Wait 0.5 seconds before hiding the loader to ensure it's visible for at least half a second

    
    const popupTokenElem = document.getElementById("popup-token")
    const openPopupTokenBtn = document.getElementById("open-popup-token")
    const hidePopupTokenBtn = document.getElementById("hide-popup-token")
    const popupTokenOverlay = document.getElementById("popup-token-overlay")



    // Controls the showing and hiding of the popup
    openPopupTokenBtn.addEventListener("click", () => showPopup(popupTokenElem))
    hidePopupTokenBtn.addEventListener("click", () => hidePopup(popupTokenElem))
    popupTokenOverlay.addEventListener("click", () => hidePopup(popupTokenElem))
})
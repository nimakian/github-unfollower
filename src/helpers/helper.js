const showPopup = (popupElement) => {
    if (popupElement) {
        popupElement.classList.remove("animate-animate-fade-out")
        popupElement.classList.add("animate-animate-fade-in")
        popupElement.classList.remove("hidden")
        popupElement.classList.add("flex")
    }
};
const hidePopup = (popupElement) => {
    if (popupElement) {
        popupElement.classList.remove("animate-animate-fade-in")
        popupElement.classList.add("animate-animate-fade-out")
        setTimeout(() => {
            popupElement.classList.remove("flex")
            popupElement.classList.add("hidden")
        }, 200);
        // The value 200 ensures that the popup is hidden only after the fade-out animation (0.2s) has completed.
    }
}

const showToast = ({ container, message, type, duration = 6000 }) => {
    if (container) {
        container.innerHTML = ""

        let iconToast = '';
        if (type === "warning") {
            iconToast = `
                <svg class="h-6 mr-3 shrink-0 fill-warning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                </svg>
            `
        } else if (type === "success") {
            iconToast = `
                <svg class="h-6 mr-3 shrink-0 fill-success" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
            `
        } else if (type === "error") {
            iconToast = `
                <svg class="h-6 mr-3 shrink-0 fill-error" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                </svg>
            `
        }
        container.insertAdjacentHTML("beforeend", `
            <div id="toast-item" class="p-3 max-w-sm flex items-center rounded-lg bg-background-box text-text-primary border border-border-box animate-animate-slide-in">
                ${iconToast}
                <span class="text-sm leading-relaxed">${message}</span>
            </div>
        `)

        const toastItemElem = document.getElementById("toast-item")
        setTimeout(() => {
            toastItemElem.classList.remove("animate-animate-slide-in")
            toastItemElem.classList.add("animate-animate-slide-out")
            setTimeout(() => {
                toastItemElem.remove()
            }, 500);
            // Wait 500ms to allow the "slide-out" animation to finish before removing the toast from DOM
        }, duration);
        // "duration" defines how long the toast should stay visible before starting the hide animation
    }
}

const getFromLocal = (key) => {
    return JSON.parse(localStorage.getItem(key))
}
const addToLocal = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
}

const getUsersNotFollowingMe = ({ following, followers }) => {
    const usersNotFollowingMe = []

    following.forEach((user, username) => {
        if (!followers.has(username)) {
            usersNotFollowingMe.push(user)
        }
    });

    return usersNotFollowingMe
}
const getUsersINotFollowingBack = ({ followers, following }) => {
    const usersINotFollowingBack = []

    followers.forEach((user, username) => {
        if (!following.has(username)) {
            usersINotFollowingBack.push(user)
        }
    });

    return usersINotFollowingBack
}


export {
    showPopup,
    hidePopup,
    showToast,
    getFromLocal,
    addToLocal,
    getUsersNotFollowingMe,
    getUsersINotFollowingBack,
}
import {
    showPopup,
    hidePopup,
    addToLocal,
    getFromLocal,
    showToast,
    changeBtnStatus,
    getUsersNotFollowingMe,
    getUsersINotFollowingBack,
} from "../helpers/helper.js";
import {
    getFollowers,
    getFollowing,
    getRateLimit,
    getUserProfileInfo,
} from "../services/service.js";


window.addEventListener("load", () => {
    const loaderElem = document.getElementById("loader")
    setTimeout(() => {
        loaderElem.classList.remove("flex")
        loaderElem.classList.add("hidden")
    }, 500);
    // Wait 0.5 seconds before hiding the loader to ensure it's visible for at least half a second


    const popupTokenElem = document.getElementById("popup-token")
    const popupTokenOpenBtn = document.getElementById("popup-token-open")
    const popupTokenHideBtn = document.getElementById("popup-token-hide")
    const popupTokenOverlay = document.getElementById("popup-token-overlay")
    const popupTokenSubBtn = document.getElementById("popup-token-sub")
    const popupTokenInput = document.getElementById("popup-token-input")
    const toastContainer = document.getElementById("toast-container")
    const searchUserInput = document.getElementById("search-user-input")
    const searchUserBtn = document.getElementById("search-user-btn")



    // Controls the showing and hiding of the popup
    popupTokenOpenBtn.addEventListener("click", () => {
        popupTokenInput.value = getFromLocal("token")
        showPopup(popupTokenElem)
    })
    popupTokenHideBtn.addEventListener("click", () => hidePopup(popupTokenElem))
    popupTokenOverlay.addEventListener("click", () => hidePopup(popupTokenElem))

    // Store the token in local storage
    popupTokenSubBtn.addEventListener("click", async () => {
        const tokenValue = popupTokenInput.value.trim()
        if (tokenValue) {
            const originalText = popupTokenSubBtn.textContent;
            changeBtnStatus({
                btn: popupTokenSubBtn,
                status: false,
                text: "Checking token...",
            });

            const getRateLimitRes = await getRateLimit(tokenValue)

            if (getRateLimitRes.resources) {
                showToast({ container: toastContainer, message: "Token has been successfully saved!", type: "success", duration: 4000 })
                addToLocal("token", tokenValue)
                hidePopup(popupTokenElem)
            } else if (getRateLimitRes.status === "401") {
                showToast({ container: toastContainer, message: "Invalid token. Please try again.", type: "error", duration: 4000 })
            } else {
                showToast({ container: toastContainer, message: "An unexpected error occurred. Please try again.", type: "error", duration: 4000 })
            }

            changeBtnStatus({
                btn: popupTokenSubBtn,
                status: true,
                text: originalText,
            });
        } else {
            showToast({ container: toastContainer, message: "Please enter your token.", type: "error", duration: 4000 })
        }
    })

    // Trigger submit on Enter key press in token input
    popupTokenInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            popupTokenSubBtn.click()
        }
    });

    // Fetches a user's followers & following (with or without token), handles rate limits, and returns both lists
    const fetchFollowersAndFollowing = async (tokenRateInfo, userName, token) => {
        let getUserProfileInfoRes = null
        if (tokenRateInfo.useToken) {
            getUserProfileInfoRes = await getUserProfileInfo({ userName, token })
        } else {
            getUserProfileInfoRes = await getUserProfileInfo({ userName })
        }

        if (getUserProfileInfoRes.login) {
            const requestsNeeded = Math.ceil(getUserProfileInfoRes.followers / 100) + Math.ceil(getUserProfileInfoRes.following / 100)

            if (tokenRateInfo.useToken) {

                // Deduct 1 from rateRemaining since getUserProfileInfo function already used one API request
                if (requestsNeeded <= (tokenRateInfo.rateRemaining - 1)) {
                    // Proceed with fetching followers and following lists

                    showToast({ container: toastContainer, message: "Finding users who don’t follow back or aren’t followed back. Please wait...", type: "search", duration: 6000 })
                    const following = await getFollowing({ userName, token })
                    const followers = await getFollowers({ userName, token })

                    return { following, followers }

                } else if (requestsNeeded >= 4_999) {
                    // Even with 5000 requests/hour (GitHub's max limit), this account can't be processed
                    // 1 request was already used for fetching the user's profile, so only 4999 remain
                    showToast({ container: toastContainer, message: "Even GitHub’s highest API limit (5000 requests/hour) isn’t enough to process this account. Please consider using a more advanced method or tool.", type: "warning", duration: 7000 })
                } else {
                    // Not enough remaining requests even with token
                    showToast({ container: toastContainer, message: "GitHub API limit exceeded. Please try again within an hour.", type: "warning", duration: 5000 })
                }

            } else {

                if (requestsNeeded <= (tokenRateInfo.rateRemaining - 1)) {
                    // Proceed with fetching followers and following lists

                    showToast({ container: toastContainer, message: "Finding users who don’t follow back or aren’t followed back. Please wait...", type: "search", duration: 6000 })
                    const following = await getFollowing({ userName })
                    const followers = await getFollowers({ userName })

                    return { following, followers }

                } else {
                    // If not enough requests remain, retry using a token to increase API limits.

                    if (token) {
                        const getRateLimitRes = await getRateLimit(token)
                        if (getRateLimitRes.resources) {

                            await fetchFollowersAndFollowing(
                                { useToken: true, rateRemaining: getRateLimitRes.rate.remaining }, userName, token
                            )

                        } else if (getRateLimitRes.status === "401") {
                            // Invalid or expired token detected
                            showToast({ container: toastContainer, message: "Your token is invalid or has expired. Please check your GitHub token and try again.", type: "error", duration: 5000 })
                            showPopup(popupTokenElem)
                        }

                    } else {
                        showToast({ container: toastContainer, message: "Public request limit reached. A token is required to continue.", type: "warning", duration: 6000 })
                        showPopup(popupTokenElem)
                    }


                }

            }
        } else if (getUserProfileInfoRes.status === "404") {
            showToast({ container: toastContainer, message: "No user found with this username. Please try again.", type: "warning", duration: 5000 })
        } else if (getUserProfileInfoRes.message?.includes("API rate limit exceeded")) {
            showToast({ container: toastContainer, message: "GitHub API limit exceeded. Please try again within an hour.", type: "warning", duration: 5000 })
        } else {
            showToast({ container: toastContainer, message: "An unexpected error occurred. Please try again.", type: "error", duration: 5000 })
        }

        return null
    }

    //checks rate limit, fetches followers & following, and extracts usersNotFollowingMe / usersINotFollowingBack
    searchUserBtn.addEventListener("click", async () => {
        const userName = searchUserInput.value.trim()

        if (userName) {
            const originalText = searchUserBtn.innerHTML;
            changeBtnStatus({
                btn: searchUserBtn,
                status: false,
                text: "Please wait",
            });

            const token = getFromLocal("token")
            const getRateLimitRes = await getRateLimit()

            if (getRateLimitRes.rate.remaining === 0) {
                // GitHub API rate limit has been reached


                if (token) {
                    const getRateLimitRes = await getRateLimit(token)

                    if (getRateLimitRes.resources) {
                        if (getRateLimitRes.rate.remaining > 0) {
                            // Rate limit resolved by providing a valid token

                            const fetchFollowersAndFollowingRes = await fetchFollowersAndFollowing(
                                { useToken: true, rateRemaining: getRateLimitRes.rate.remaining }, userName, token
                            )

                            if (fetchFollowersAndFollowingRes) {
                                const { following, followers } = fetchFollowersAndFollowingRes;

                                const usersNotFollowingMe = getUsersNotFollowingMe({ following, followers });
                                const usersINotFollowingBack = getUsersINotFollowingBack({ following, followers });
                            }
                        } else {
                            // Token provided but rate limit still exceeded
                            showToast({ container: toastContainer, message: "GitHub API limit exceeded. Please try again within an hour.", type: "warning", duration: 5000 })
                        }
                    } else if (getRateLimitRes.status === "401") {
                        // Invalid or expired token detected
                        showToast({ container: toastContainer, message: "Your token is invalid or has expired. Please check your GitHub token and try again.", type: "error", duration: 5000 })
                        showPopup(popupTokenElem)
                    }

                } else {
                    showToast({ container: toastContainer, message: "Public request limit reached. A token is required to continue.", type: "warning", duration: 6000 })
                    showPopup(popupTokenElem)
                }
            } else {
                // GitHub API rate limit has not been reached

                const fetchFollowersAndFollowingRes = await fetchFollowersAndFollowing(
                    { useToken: false, rateRemaining: getRateLimitRes.rate.remaining }, userName, token
                )

                if (fetchFollowersAndFollowingRes) {
                    const { following, followers } = fetchFollowersAndFollowingRes;

                    const usersNotFollowingMe = getUsersNotFollowingMe({ following, followers });
                    const usersINotFollowingBack = getUsersINotFollowingBack({ following, followers });
                }
            }

            changeBtnStatus({
                btn: searchUserBtn,
                status: true,
                text: originalText,
            });
        } else {
            showToast({ container: toastContainer, message: "Please enter a GitHub username to search.", type: "warning", duration: 5000 })
        }
    })

})
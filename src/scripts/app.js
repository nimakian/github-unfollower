import {
    showPopup,
    hidePopup,
    addToLocal,
    getFromLocal,
    showToast,
    changeBtnStatus,
    getUsersNotFollowingMe,
    getUsersINotFollowingBack,
    changeInputStatus,
    showSkeletonLoaders,
} from "../helpers/helper.js";
import {
    getFollowers,
    getFollowing,
    getRateLimit,
    getUserProfileInfo,
    getLatestPublicEventDate, // <-- import the new function
} from "../services/service.js";


window.addEventListener("load", () => {
    // Show loading skeletons for notFollowedBack and notFollowingBack containers
    const notFollowingBackContainer = document.getElementById("not-followingBack-container")
    const notFollowedBackContainer = document.getElementById("not-followedBack-container")
    showSkeletonLoaders({ container: notFollowingBackContainer })
    showSkeletonLoaders({ container: notFollowedBackContainer })

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
    const notFollowingBackPagination = document.getElementById("not-followingBack-pagination")
    const notFollowedBackPagination = document.getElementById("not-followedBack-pagination")



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

    // sets up event listeners for "Next" and "Previous" pagination buttons.
    const setupPaginationControls = ({ usersArray, container, currentPage, itemsPerPage, paginationContainerSelector }) => {
        renderUsersPage({ usersArray, container, currentPage, itemsPerPage, paginationContainerSelector })

        paginationContainerSelector.querySelector(".next-btn").onclick = () => {
            renderUsersPage({ usersArray, container, currentPage: ++currentPage, itemsPerPage, paginationContainerSelector })
        }
        paginationContainerSelector.querySelector(".prev-btn").onclick = () => {
            renderUsersPage({ usersArray, container, currentPage: --currentPage, itemsPerPage, paginationContainerSelector })
        }
    }

    // Helper to check if a date is more than 1 year ago
    const isInactive = (dateString) => {
        if (!dateString) return true;
        const lastDate = new Date(dateString);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return lastDate < oneYearAgo;
    };

    // Renders a specific page of users from a given array into the provided container.
    // Updates pagination UI (current page, total pages, and button states).
    const renderUsersPage = async ({ usersArray, container, currentPage, itemsPerPage, paginationContainerSelector }) => {
        const totalPages = Math.ceil(usersArray.length / itemsPerPage);
        paginationContainerSelector.querySelector(".current-page").innerHTML = currentPage;
        paginationContainerSelector.querySelector(".total-pages").innerHTML = totalPages;

        const prevBtnPagination = paginationContainerSelector.querySelector(".prev-btn")
        const nextBtnPagination = paginationContainerSelector.querySelector(".next-btn")

        if (currentPage === 1) {
            prevBtnPagination.disabled = true
            prevBtnPagination.classList.remove("cursor-pointer")
            prevBtnPagination.classList.add("cursor-not-allowed", "opacity-50")
        } else {
            prevBtnPagination.disabled = false
            prevBtnPagination.classList.remove("cursor-not-allowed", "opacity-50")
            prevBtnPagination.classList.add("cursor-pointer")
        }

        if (currentPage === totalPages) {
            nextBtnPagination.disabled = true
            nextBtnPagination.classList.remove("cursor-pointer")
            nextBtnPagination.classList.add("cursor-not-allowed", "opacity-50")
        } else {
            nextBtnPagination.disabled = false
            nextBtnPagination.classList.remove("cursor-not-allowed", "opacity-50")
            nextBtnPagination.classList.add("cursor-pointer")
        }

        container.innerHTML = "";
        const startIndex = (currentPage - 1) * itemsPerPage;
        let paginatedUsers = usersArray.slice(startIndex, startIndex + itemsPerPage);
        // If filter is on, filter users to only inactive
        if (showOnlyInactive) {
            paginatedUsers = paginatedUsers.filter(user => user._isInactive === true);
        }
        if (paginatedUsers.length) {
            paginatedUsers.forEach(user => {
                container.insertAdjacentHTML("beforeend", `
                    <a class="user-item w-full p-2 bg-background-box border border-border-box rounded-md flex items-center relative" href="https://github.com/${user.userName}" target="_blank">
                        <img class="w-9 h-9 rounded-full" src="${user.profile}" />
                        <span class="text-sm ml-3 text-text-secondary">@${user.userName}</span>
                        <span class="activity-status ml-6" style="font-size:9px; color:#bdbdbd; font-weight:400;">Checking</span>
                    </a>
                `);
            });
            paginatedUsers.forEach(async (user, idx) => {
                const token = getFromLocal("token");
                const latestEventDate = await getLatestPublicEventDate({ userName: user.userName, token });
                const userItems = container.getElementsByClassName("user-item");
                const userElem = userItems[idx];
                const statusElem = userElem.querySelector(".activity-status");
                if (isInactive(latestEventDate)) {
                    statusElem.textContent = "Inactive";
                    statusElem.className = "activity-status ml-6 inline-block text-[10px] font-medium rounded-full align-middle transition-all";
                    statusElem.style.background = '#fef2f2';
                    statusElem.style.color = '#dc2626';
                    statusElem.style.border = '1px solid #fca5a5';
                    statusElem.style.boxShadow = '0 1px 2px 0 rgba(220,38,38,0.04)';
                    statusElem.style.fontWeight = '500';
                    statusElem.style.fontSize = '10px';
                    statusElem.style.padding = '1px 7px';
                    statusElem.style.minWidth = '38px';
                    userElem.classList.add("opacity-60");
                    user._isInactive = true;
                } else {
                    statusElem.textContent = "Active";
                    statusElem.className = "activity-status ml-6 inline-block text-[10px] font-medium rounded-full align-middle transition-all";
                    statusElem.style.background = '#f0fdf4';
                    statusElem.style.color = '#16a34a';
                    statusElem.style.border = '1px solid #6ee7b7';
                    statusElem.style.boxShadow = '0 1px 2px 0 rgba(16,185,129,0.04)';
                    statusElem.style.fontWeight = '500';
                    statusElem.style.fontSize = '10px';
                    statusElem.style.padding = '1px 7px';
                    statusElem.style.minWidth = '38px';
                    user._isInactive = false;
                }
            });
        } else {
            container.insertAdjacentHTML("beforeend", `
                <div class="flex flex-col items-center text-text-secondary py-25">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <h3 class="mt-2">No users found in this category.</h3>
                </div>
            `);
        }

    }

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
                    showSkeletonLoaders({ container: notFollowingBackContainer })
                    showSkeletonLoaders({ container: notFollowedBackContainer })
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
                    showSkeletonLoaders({ container: notFollowingBackContainer })
                    showSkeletonLoaders({ container: notFollowedBackContainer })
                    const following = await getFollowing({ userName })
                    const followers = await getFollowers({ userName })

                    return { following, followers }

                } else {
                    // If not enough requests remain, retry using a token to increase API limits.

                    if (token) {
                        const getRateLimitRes = await getRateLimit(token)
                        if (getRateLimitRes.resources) {

                            return await fetchFollowersAndFollowing(
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
            changeInputStatus({
                input: searchUserInput,
                status: false
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
                                lastNotFollowingBackArray = usersNotFollowingMe;
                                lastNotFollowedBackArray = usersINotFollowingBack;
                                setupPaginationControls({
                                    usersArray: usersNotFollowingMe,
                                    container: notFollowingBackContainer,
                                    currentPage: 1,
                                    itemsPerPage: 9,
                                    paginationContainerSelector: notFollowingBackPagination
                                })
                                setupPaginationControls({
                                    usersArray: usersINotFollowingBack,
                                    container: notFollowedBackContainer,
                                    currentPage: 1,
                                    itemsPerPage: 9,
                                    paginationContainerSelector: notFollowedBackPagination
                                })
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
                    lastNotFollowingBackArray = usersNotFollowingMe;
                    lastNotFollowedBackArray = usersINotFollowingBack;
                    setupPaginationControls({
                        usersArray: usersNotFollowingMe,
                        container: notFollowingBackContainer,
                        currentPage: 1,
                        itemsPerPage: 9,
                        paginationContainerSelector: notFollowingBackPagination
                    })
                    setupPaginationControls({
                        usersArray: usersINotFollowingBack,
                        container: notFollowedBackContainer,
                        currentPage: 1,
                        itemsPerPage: 9,
                        paginationContainerSelector: notFollowedBackPagination
                    })
                }
            }

            changeBtnStatus({
                btn: searchUserBtn,
                status: true,
                text: originalText,
            });
            changeInputStatus({
                input: searchUserInput,
                status: true
            });
        } else {
            showToast({ container: toastContainer, message: "Please enter a GitHub username to search.", type: "warning", duration: 5000 })
        }
    })

    // Triggers search button click when Enter is pressed in the input field
    searchUserInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            searchUserBtn.click()
        }
    });

})
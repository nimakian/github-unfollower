import {
    changeBtnStatus,
    changeInputStatus,
    showToast,
} from "./../helpers/helper.js"

const searchUserBtn = document.getElementById("search-user-btn")
const searchUserInput = document.getElementById("search-user-input")
const toastContainer = document.getElementById("toast-container")


const getUserProfileInfo = async ({ userName, token }) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`
    }

    const retry = 5;
    let attempt = 1;

    for (attempt; attempt <= retry; attempt++) {
        try {
            const res = await fetch(`https://api.github.com/users/${userName}`, { headers })

            if (!res.ok) {
                throw new Error("Request Failed ...");
            }

            const data = await res.json()
            return data
        } catch (err) {
            if (attempt === retry) {
                changeBtnStatus({
                    btn: searchUserBtn,
                    status: true,
                    text: "Search User",
                });
                changeInputStatus({
                    input: searchUserInput,
                    status: true
                });
                showToast({ container: toastContainer, message: "Operation failed. Please try again shortly.", type: "error", duration: 5000 })

                throw err;
            }

            const backoffTime = 2 ** (attempt - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
    }
}

const getRateLimit = async (token) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`
    }

    const retry = 5;
    let attempt = 1;

    for (attempt; attempt <= retry; attempt++) {
        try {
            const res = await fetch(`https://api.github.com/rate_limit`, { headers })

            if (!res.ok) {
                throw new Error("Request Failed ...");
            }

            const data = await res.json();
            return data;
        } catch (err) {
            if (attempt === retry) {
                changeBtnStatus({
                    btn: searchUserBtn,
                    status: true,
                    text: "Search User",
                });
                changeInputStatus({
                    input: searchUserInput,
                    status: true
                });
                showToast({ container: toastContainer, message: "Operation failed. Please try again shortly.", type: "error", duration: 5000 })

                throw err;
            }

            const backoffTime = 2 ** (attempt - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
    }

}

const getFollowingAndFollowers = async ({ userName, token, type }) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`;
    }
    const perPage = 100;
    let page = 1;
    let hasMore = true;
    let users = new Map();
    const retry = 5;
    let attempt = 1;


    while (hasMore) {
        for (attempt; attempt <= retry; attempt++) {
            try {
                const res = await fetch(`https://api.github.com/users/${userName}/${type}?per_page=${perPage}&page=${page}`, { headers });

                if (!res.ok) {
                    throw new Error("Request Failed ...");
                }

                const data = await res.json();
                data.forEach(user => users.set(
                    user.login,
                    {
                        userName: user.login,
                        profile: user.avatar_url,
                    }
                ));
                hasMore = data.length === perPage;
                page++;
                attempt = 1;

                break;
            } catch (err) {
                if (attempt === retry) {
                    changeBtnStatus({
                        btn: searchUserBtn,
                        status: true,
                        text: "Search User",
                    });
                    changeInputStatus({
                        input: searchUserInput,
                        status: true
                    });
                    showToast({ container: toastContainer, message: "Operation failed. Please try again shortly.", type: "error", duration: 5000 })

                    throw err;
                }

                const backoffTime = 2 ** (attempt - 1) * 1000;
                await new Promise((resolve) => setTimeout(resolve, backoffTime));
            }
        }





    }

    return users;
};


export {
    getUserProfileInfo,
    getRateLimit,
    getFollowingAndFollowers,
}
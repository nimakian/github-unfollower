const getUserProfileInfo = async (username) => {
    const res = await fetch(`https://api.github.com/users/${username}`)
    const data = await res.json()
    return data
}

const getRateLimit = async (token) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`
    }

    const res = await fetch(`https://api.github.com/rate_limit`, { headers })
    const data = await res.json();
    return data
}

export {
    getUserProfileInfo,
    getRateLimit,
}
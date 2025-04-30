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

const getFollowing = async ({ username, token }) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`
    }
    const perPage = 100
    let page = 1
    let hasMore = true
    let following = new Map()

    while (hasMore) {
        const res = await fetch(`https://api.github.com/users/${username}/following?per_page=${perPage}&page=${page}`, { headers })
        const data = await res.json()
        data.forEach(user => following.set(
            user.login,
            {
                username: user.login,
                profile: user.avatar_url,
            }
        ))
        hasMore = data.length === perPage;
        page++;
    }

    return following
}

const getFollowers = async ({ username, token }) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`;
    }
    const perPage = 100;
    let page = 1;
    let hasMore = true;
    let followers = new Map();

    while (hasMore) {
        const res = await fetch(`https://api.github.com/users/${username}/followers?per_page=${perPage}&page=${page}`, { headers });
        const data = await res.json();
        data.forEach(user => followers.set(
            user.login,
            {
                username: user.login,
                profile: user.avatar_url,
            }
        ));
        hasMore = data.length === perPage;
        page++;
    }

    return followers;
};


export {
    getUserProfileInfo,
    getRateLimit,
    getFollowing,
    getFollowers,
}
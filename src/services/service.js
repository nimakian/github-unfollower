const getUserProfileInfo = async ({ userName, token }) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`
    }

    const res = await fetch(`https://api.github.com/users/${userName}`, { headers })
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

const getFollowing = async ({ userName, token }) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`
    }
    const perPage = 100
    let page = 1
    let hasMore = true
    let following = new Map()

    while (hasMore) {
        const res = await fetch(`https://api.github.com/users/${userName}/following?per_page=${perPage}&page=${page}`, { headers })
        const data = await res.json()
        data.forEach(user => following.set(
            user.login,
            {
                userName: user.login,
                profile: user.avatar_url,
            }
        ))
        hasMore = data.length === perPage;
        page++;
    }

    return following
}

const getFollowers = async ({ userName, token }) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`;
    }
    const perPage = 100;
    let page = 1;
    let hasMore = true;
    let followers = new Map();

    while (hasMore) {
        const res = await fetch(`https://api.github.com/users/${userName}/followers?per_page=${perPage}&page=${page}`, { headers });
        const data = await res.json();
        data.forEach(user => followers.set(
            user.login,
            {
                userName: user.login,
                profile: user.avatar_url,
            }
        ));
        hasMore = data.length === perPage;
        page++;
    }

    return followers;
};

// Fetches the date of the latest public event for a user
const getLatestPublicEventDate = async ({ userName, token }) => {
    const headers = {};
    if (token) {
        headers.Authorization = `token ${token}`;
    }
    // Fetch the user's public events (most recent first)
    const res = await fetch(`https://api.github.com/users/${userName}/events/public?per_page=1`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].created_at) {
        return data[0].created_at;
    }
    return null; // No public events found
}


export {
    getUserProfileInfo,
    getRateLimit,
    getFollowing,
    getFollowers,
    getLatestPublicEventDate,
}
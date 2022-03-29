import * as pt from './crypto.js'

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
    "Access-Control-Allow-Credentials": "true",
    'Allow': 'POST,OPTIONS',
};

export function cors(request, response) {
    let response1;
    if (response === null) {
        response1 = new Response(null, {
            headers: {
                ...CORS_HEADERS,
            },
        })
    } else {
        response1 = new Response(response.body, response);
        for (let header in CORS_HEADERS) {
            response1.headers.set(header, CORS_HEADERS[header]);
        }
    }
    
    response1.headers.set('Access-Control-Allow-Headers', request.headers.get('Access-Control-Request-Headers'))
    response1.headers.append('Vary', 'Origin');
    return response1;
}

export async function encrypt(request, env) {
    const kv = env.kv;
    const body = await request.text()
    const headers = request.headers
    const password = headers.get('x-app-password')
    if (!body || !password) {
        return new Response('', { status: 401 })
    }

    try {
        const encrypted = await pt.encrypt(body, password)
        const flag = headers.get('x-app-kv') || ''
        if (flag !== 'true') {
            return new Response(encrypted, {
                headers: { 'content-type': 'text/plain' }
            })
        }

        const key = pt.uuid()
        await kv.put(key, encrypted)
        return new Response(key, {
            headers: { 'content-type': 'text/plain' }
        })
    } catch (error) {
        return new Response('', { status: 500 })
    }
}

export async function decrypt(request, env) {
    const kv = env.kv;
    const headers = request.headers
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return new Response('', { status: 401 })
    }
    const {password, key} = await request.json();
    if (!password || !key) {
        return new Response('', { status: 401 })
    }

    try {
        const encrypted = await kv.get(key)
        if (encrypted === null) {
            return new Response('', { status: 401 })
        }

        const decrypted = await pt.decrypt(encrypted, password);
        return new Response(decrypted, {
            headers: { 'content-type': 'text/plain' }
        })
    } catch (error) {
        return new Response('', { status: 500 })
    }
}

export async function truncate(request, env) {
    const kv = env.kv;
    const secret = env.TRUNCATE_SECRET;
    const key = request.headers.get('x-app-truncate');
    if (key !== secret) {
        return new Response('', { status: 403 })
    }

    const value = await kv.list()
    await Promise.all(value.keys.map(async (key) => {
        await kv.delete(key.name)
    }));

    return new Response('ok', {
        headers: { 'content-type': 'text/plain' }
    })
} 
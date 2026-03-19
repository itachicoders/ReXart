const DEFAULT_ENDPOINT = 'api-s.anixsekai.com';

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function getStoredUserToken() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return safeParse(window.localStorage.getItem('user_token'));
}

export function getCurrentToken() {
  return window?.anixApi?.client?.token || getStoredUserToken()?.token || null;
}

export function getCurrentUserId() {
  return getStoredUserToken()?.id || null;
}

export function getApiBaseUrl() {
  const fromClient = window?.anixApi?.client?.baseUrl;
  if (fromClient) return fromClient;

  if (typeof window !== 'undefined' && window.localStorage) {
    const endpoint = window.localStorage.getItem('endpointUrl') || DEFAULT_ENDPOINT;
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return `https://${endpoint}`;
  }

  return `https://${DEFAULT_ENDPOINT}`;
}

function getCommentBasePath(type = 'release') {
  return type === 'collection' ? '/collection/comment' : '/release/comment';
}

function buildUrl(path, query = {}) {
  const url = new URL(path, getApiBaseUrl());
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function request(path, { query = {}, method = 'GET', body = null, headers = {} } = {}) {
  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function fetchCommentsPage({ type = 'release', entityId, page = 0, sort = 1 } = {}) {
  return request(`${getCommentBasePath(type)}/all/${entityId}/${page}`, {
    query: {
      sort,
      token: getCurrentToken(),
    },
  });
}

export async function fetchCommentReplies({ type = 'release', commentId, page = 0, sort = 2 } = {}) {
  return request(`${getCommentBasePath(type)}/replies/${commentId}/${page}`, {
    query: {
      sort,
      token: getCurrentToken(),
    },
  });
}

export async function addComment({
  type = 'release',
  entityId,
  message,
  parentCommentId = null,
  replyToProfileId = null,
  spoiler = false,
} = {}) {
  return request(`${getCommentBasePath(type)}/add/${entityId}`, {
    method: 'POST',
    query: {
      token: getCurrentToken(),
    },
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      parentCommentId,
      replyToProfileId,
      spoiler,
    }),
  });
}

export async function editComment({ type = 'release', commentId, message, spoiler = false } = {}) {
  return request(`${getCommentBasePath(type)}/edit/${commentId}`, {
    method: 'POST',
    query: {
      token: getCurrentToken(),
    },
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      spoiler,
    }),
  });
}

export async function deleteComment({ type = 'release', commentId } = {}) {
  return request(`${getCommentBasePath(type)}/delete/${commentId}`, {
    query: {
      token: getCurrentToken(),
    },
  });
}

export async function voteCommentRequest({ type = 'release', commentId, vote } = {}) {
  return request(`${getCommentBasePath(type)}/vote/${commentId}/${vote}`, {
    query: {
      token: getCurrentToken(),
    },
  });
}

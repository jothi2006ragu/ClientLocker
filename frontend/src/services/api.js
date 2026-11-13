
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://clientlocker-24ef.onrender.com"
).replace(/\/+$/, "");

// ==========================================
// COMMON API REQUEST
// ==========================================

async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(
      "Unable to connect to ClientLocker server. Please check whether the backend is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong. Please try again."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================

export const loginUser = async (credentials) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    })
  });
};

// DEVELOPMENT-ONLY DEMO LOGIN
export const demoLoginUser = async (credentials) => {
  return apiRequest("/api/auth/test-login", {
    method: "POST",
    body: JSON.stringify({
      role: credentials.role,
      email: credentials.email
    })
  });
};

// Google login
export const googleLoginUser = async (credential) => {
  return apiRequest("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential })
  });
};

// Get currently authenticated user
export const getCurrentUser = async () => {
  return apiRequest("/api/auth/me", {
    method: "GET"
  });
};

// ==========================================
// CLIENT MAGIC-LINK APIs
// ==========================================

export const requestMagicLink = async (email) => {
  return apiRequest("/api/auth/magic-link/request", {
    method: "POST",
    body: JSON.stringify({ email })
  });
};

export const verifyMagicLink = async (token) => {
  return apiRequest("/api/auth/magic-link/verify", {
    method: "POST",
    body: JSON.stringify({ token })
  });
};

// ==========================================
// CLIENT FILE APIs
// ==========================================

// Get all files belonging to a client
export const getClientFiles = async (clientId) => {
  if (!clientId) {
    throw new Error("Client ID is missing.");
  }

  return apiRequest(`/api/clients/${clientId}/files`, {
    method: "GET"
  });
};

// Upload a file to a client
// FormData field name must be "file"
export const uploadClientFile = async (
  clientId,
  file,
  checklistItemId = null
) => {
  if (!clientId) {
    throw new Error("Client ID is missing.");
  }

  if (!file) {
    throw new Error("Please select a file.");
  }

  const formData = new FormData();

  formData.append("file", file);

  if (checklistItemId) {
    formData.append("checklist_item_id", checklistItemId);
  }

  return apiRequest(`/api/clients/${clientId}/files`, {
    method: "POST",
    body: formData
  });
};

// ==========================================
// TASK 6: SECURE DOWNLOAD LINKS
// ==========================================

// Generate a temporary 10-minute download link.
export const createDownloadLink = async (fileId) => {
  if (!fileId) {
    throw new Error("File ID is missing.");
  }

  return apiRequest(`/api/files/${fileId}/link`, {
    method: "POST"
  });
};

// Download file through the authenticated backend endpoint.
// Backend endpoint: GET /api/links/:token
export const downloadClientFile = async (downloadUrl) => {
  const validDownloadPath =
    /^\/api\/links\/[a-f\d]{64}$/i;

  if (
    typeof downloadUrl !== "string" ||
    !validDownloadPath.test(downloadUrl)
  ) {
    throw new Error("Invalid secure download link.");
  }

  const token = sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in again to download this file.");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${downloadUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch {
    throw new Error("Unable to connect to ClientLocker server.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    const error = new Error(
      errorData.message || "Unable to download this file."
    );

    error.status = response.status;
    error.data = errorData;

    throw error;
  }

  return response.blob();
};

// Generate link and retrieve file in one operation.
export const openClientFile = async (fileId) => {
  const linkResponse = await createDownloadLink(fileId);

  const downloadUrl =
    linkResponse.downloadUrl ||
    linkResponse.data?.downloadUrl;

  if (!downloadUrl) {
    throw new Error("Backend did not return a download link.");
  }

  const blob = await downloadClientFile(downloadUrl);

  return {
    blob,
    expiresAt: linkResponse.expiresAt,
    expiresIn: linkResponse.expiresIn
  };
};

// ==========================================
// OPEN OR DOWNLOAD FILE USING BLOB
// ==========================================

export const openFileInBrowser = (blob, fileName) => {
  if (!(blob instanceof Blob)) {
    throw new Error("Downloaded file data is invalid.");
  }

  const objectUrl = window.URL.createObjectURL(blob);

  const downloadElement = document.createElement("a");

  downloadElement.href = objectUrl;
  downloadElement.download = fileName || "download";

  document.body.appendChild(downloadElement);
  downloadElement.click();

  document.body.removeChild(downloadElement);

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);
};

// ==========================================
// CHECKLIST APIs
// ==========================================

export const getClientChecklist = async (clientId) => {
  if (!clientId) {
    throw new Error("Client ID is missing.");
  }

  return apiRequest(`/api/clients/${clientId}/checklist`, {
    method: "GET"
  });
};

export const updateChecklistItem = async (itemId, done) => {
  if (!itemId) {
    throw new Error("Checklist item ID is missing.");
  }

  if (typeof done !== "boolean") {
    throw new Error("Checklist status must be true or false.");
  }

  return apiRequest(`/api/checklist/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ done })
  });
};

// ==========================================
// EXPORTS
// ==========================================

export {
  apiRequest,
  API_BASE_URL
};

export default apiRequest;

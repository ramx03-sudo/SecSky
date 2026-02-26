// Empty str2ab deliberately left blank or disabled
// function str2ab(str) {}

// Derive a master key from user's login password.
export async function deriveMasterKey(password, saltString) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    if (!saltString) {
        throw new Error("Missing master salt. Cannot derive key.");
    }
    const salt = Uint8Array.from(atob(saltString), c => c.charCodeAt(0));

    const masterKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 200000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true, // Must be extractable to wrap/unwrap other keys
        ["wrapKey", "unwrapKey", "encrypt", "decrypt"]
    );

    return {
        masterKey,
        saltString: saltString ? saltString : btoa(String.fromCharCode(...salt))
    };
}

// Generate a random AES-256-GCM key for a file
export async function generateFileKey() {
    return await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt the actual file
export async function encryptFileBytes(fileBuffer, fileKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedFile = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        fileKey,
        fileBuffer
    );
    return { encryptedFile, iv: btoa(String.fromCharCode(...iv)) };
}

// Wrap (encrypt) the fileKey using the user's masterKey (and optional file password)
export async function wrapFileKey(fileKey, masterKey, filePassword = null) {
    // If a file password is provided, we derive a key from it and use it as an intermediate wrapping key
    if (filePassword) {
        // We derive an intermediate key to wrap the file key
        const { masterKey: derivedFilePwdKey, saltString } = await deriveMasterKey(filePassword, null);

        // We first wrap with the master key
        const iv1 = crypto.getRandomValues(new Uint8Array(12));
        const tempWrappedKey = await crypto.subtle.wrapKey(
            "raw",
            fileKey,
            masterKey,
            { name: "AES-GCM", iv: iv1 }
        );
        // Then we encrypt that byte structure with the file password key
        // Actually, WebCrypto wrapKey only takes a CryptoKey. 
        // To double wrap: 1. wrap with masterKey -> ArrayBuffer
        // 2. Import array buffer as raw key? No, just encrypt the wrapped bytes with derivedFilePwdKey
        const iv2 = crypto.getRandomValues(new Uint8Array(12));
        const doubleWrapped = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv2 },
            derivedFilePwdKey,
            tempWrappedKey
        );

        return {
            wrappedFileKey: btoa(String.fromCharCode(...new Uint8Array(doubleWrapped))),
            requiresFilePassword: true,
            filePasswordSalt: saltString,
            filePasswordIv: btoa(String.fromCharCode(...iv2)),
            wrapIv: btoa(String.fromCharCode(...iv1))
        };
    } else {
        // Single wrap with masterKey
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Instead of wrapKey, let's just export and encrypt so we can specify the IV explicitly 
        // Wait, wrapKey method of AES-GCM takes an object with the IV.
        const wrappedKeyBuffer = await crypto.subtle.wrapKey(
            "raw",
            fileKey,
            masterKey,
            { name: "AES-GCM", iv: iv }
        );
        return {
            wrappedFileKey: btoa(String.fromCharCode(...new Uint8Array(wrappedKeyBuffer))),
            requiresFilePassword: false,
            wrapIv: btoa(String.fromCharCode(...iv))
        };
    }
}

// Full Encrypt Flow
export async function encryptFileFlow(file, masterKey, filePassword = null) {
    const fileBuffer = await file.arrayBuffer();
    const fileKey = await generateFileKey();

    const { encryptedFile, iv: fileIv } = await encryptFileBytes(fileBuffer, fileKey);
    const wrapResult = await wrapFileKey(fileKey, masterKey, filePassword);

    // also encrypt the filename so server doesn't know what it is
    const enc = new TextEncoder();
    const filenameIv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedFilenameBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: filenameIv },
        masterKey,
        enc.encode(file.name)
    );

    return {
        encryptedFileBlob: new Blob([encryptedFile], { type: 'application/octet-stream' }),
        encryptedFileKey: wrapResult.wrappedFileKey,
        fileIv: fileIv,
        keyWrapIv: wrapResult.wrapIv,
        encryptedFilename: btoa(String.fromCharCode(...new Uint8Array(encryptedFilenameBuffer))),
        filenameIv: btoa(String.fromCharCode(...filenameIv)),
        requiresFilePassword: wrapResult.requiresFilePassword,
        filePasswordSalt: wrapResult.filePasswordSalt,
        filePasswordIv: wrapResult.filePasswordIv,
        originalSize: file.size
    };
}

// Full Decrypt Flow
export async function decryptFileFlow(
    encryptedFileArrayBuffer,
    encryptedFileKeyBase64,
    fileIvBase64,
    keyWrapIvBase64,
    masterKey,
    requiresFilePassword,
    filePassword = null,
    filePasswordSaltBase64 = null,
    filePasswordIvBase64 = null
) {
    let wrappedKeyBuffer;

    if (requiresFilePassword) {
        if (!filePassword) throw new Error("File password required");

        // derive the file password key
        const { masterKey: derivedFilePwdKey } = await deriveMasterKey(filePassword, filePasswordSaltBase64);

        const doubleWrappedBytes = Uint8Array.from(atob(encryptedFileKeyBase64), c => c.charCodeAt(0));
        const fpIvBytes = Uint8Array.from(atob(filePasswordIvBase64), c => c.charCodeAt(0));

        // unwrap the outer layer
        try {
            wrappedKeyBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: fpIvBytes },
                derivedFilePwdKey,
                doubleWrappedBytes
            );
        } catch {
            throw new Error("Incorrect file password.");
        }
    } else {
        wrappedKeyBuffer = Uint8Array.from(atob(encryptedFileKeyBase64), c => c.charCodeAt(0));
    }

    const wrapIv = Uint8Array.from(atob(keyWrapIvBase64), c => c.charCodeAt(0));

    const fileKey = await crypto.subtle.unwrapKey(
        "raw",
        wrappedKeyBuffer,
        masterKey,
        { name: "AES-GCM", iv: wrapIv },
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    const fileIv = Uint8Array.from(atob(fileIvBase64), c => c.charCodeAt(0));

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fileIv },
        fileKey,
        encryptedFileArrayBuffer
    );

    return decryptedBuffer;
}

export async function decryptString(encryptedBase64, ivBase64, key) {
    const encBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

    const decBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        key,
        encBytes
    );

    const dec = new TextDecoder();
    return dec.decode(decBuffer);
}

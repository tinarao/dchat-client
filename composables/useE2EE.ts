import localforage from "localforage"

type KeyPair = {
    publicKey: JsonWebKey
    encryptedPrivateKey: string
    iv: string
    createdAt: string
}

type EncryptedMessage = {
    iv: string
    cipherText: string
    salt: string
    keyVersion: string
}

type StoredKeys = {
    currentKeyPairId: string
    keyPairs: Record<string, KeyPair>
}

const STORAGE_INSTANCE_KEY = "e2ee-keys" as const;
const KEY_STORAGE_VERSION = "v1"

const store = localforage.createInstance({
    name: STORAGE_INSTANCE_KEY
})

const storeKeys = {
    MASTER_KEY: "master-key",
    MASTER_SALT: "master-salt",
    KEY_PAIR: "key-pair"
} as const;

const PBKDF2_ITERATIONS = 310000

/**
*   Composable for end-to-end encryption.
*
*   @example 
*   // Flow looks like this
*
    const masterKey = await e2ee.generateMasterKey('strong-password')
    const keyPair = await e2ee.generateKeyPair(masterKey)
    await e2ee.saveKeyPair(keyPair)

    const { publicKey, privateKey } = await e2ee.getCurrentKeyPair(masterKey)
    const sharedSecret = await e2ee.deriveSharedSecret(privateKey, recipientPublicKey)
    const encrypted = await e2ee.encryptMessage('Hello World!', sharedSecret)

    const decrypted = await e2ee.decryptMessage(encrypted, sharedSecret)
*
*/
export function useE2EE() {
    async function generateMasterKey(passphrase: string, saltMaterial: string): Promise<CryptoKey> {
        // соль всегда фиксированна
        // позволяет генерить совместимые ключи для поддержки истории сообщений
        //
        // т.е при одинаковых passphrase и fixedSalt метод будет выдавать
        // один и тот же ключ
        // 
        // TODO: генерить соль используя и уникальный ключ от сервера. пример:
        // const serverKey = fetchServerKey()
        // saltMaterial = saltMaterial.concat(serverKey)
        // const salt = new TextEncoder().encode(saltMaterial)
        //
        // проверочная фраза нигде не сохраняется

        saltMaterial.concat("")

        const salt = new TextEncoder().encode(saltMaterial)
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(passphrase),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        )

        await store.setItem(storeKeys.MASTER_SALT, arrayToBase64(salt))

        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: PBKDF2_ITERATIONS,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        )
    }

    async function generateKeyPair(masterKey: CryptoKey): Promise<KeyPair> {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-256"
            },
            true,
            ["deriveKey"]
        )

        const publicKey = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
        const privateKey = await crypto.subtle.exportKey('jwk', keyPair.privateKey)

        // encrypt private key before saving
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const encryptedPrivate = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            masterKey,
            new TextEncoder().encode(JSON.stringify(privateKey))
        )

        return {
            publicKey,
            encryptedPrivateKey: arrayToBase64(new Uint8Array(encryptedPrivate)),
            iv: arrayToBase64(iv),
            createdAt: new Date().toISOString()
        }
    }

    async function saveKeyPair(keyPair: KeyPair) {
        const existing = (await store.getItem<StoredKeys>(storeKeys.KEY_PAIR)) || {
            currentKeyPairId: '',
            keyPairs: {}
        }

        const keyPairId = crypto.randomUUID()
        existing.keyPairs[keyPairId] = keyPair
        existing.currentKeyPairId = keyPairId

        await store.setItem(storeKeys.KEY_PAIR, existing)
        return keyPairId // return id of just saved key
    }

    async function getCurrentKeyPair(masterKey: CryptoKey): Promise<{
        publicKey: JsonWebKey,
        privateKey: JsonWebKey
    }> {
        const stored = await store.getItem<StoredKeys>(storeKeys.KEY_PAIR)
        if (!stored) throw new Error("No keys found")

        const keyPair = stored.keyPairs[stored.currentKeyPairId]
        if (!keyPair) throw new Error("Current key pair not found")

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: base64ToArray(keyPair.iv) },
            masterKey,
            base64ToArray(keyPair.encryptedPrivateKey)
        )

        return {
            publicKey: keyPair.publicKey,
            privateKey: JSON.parse(new TextDecoder().decode(decrypted))
        }
    }

    async function deriveSharedSecret(
        myPrivateKey: JsonWebKey,
        theirPublicKey: JsonWebKey
    ) {
        const privateKey = await crypto.subtle.importKey(
            "jwk",
            myPrivateKey,
            { name: "ECDH", namedCurve: "P-256" },
            false,
            ["deriveKey"]
        )

        const publicKey = await crypto.subtle.importKey(
            "jwk",
            theirPublicKey,
            { name: "ECDH", namedCurve: "P-256" },
            false,
            []
        )

        return crypto.subtle.deriveKey(
            {
                name: "ECDH",
                public: publicKey,
            },
            privateKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        )
    }

    async function encryptMessage(message: string, sharedKey: CryptoKey): Promise<EncryptedMessage> {
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const salt = crypto.getRandomValues(new Uint8Array(16))
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            sharedKey,
            new TextEncoder().encode(message)
        )

        return {
            cipherText: arrayToBase64(new Uint8Array(encrypted)),
            iv: arrayToBase64(iv),
            salt: arrayToBase64(salt),
            keyVersion: KEY_STORAGE_VERSION
        }
    }

    async function decryptMessage(encrypted: EncryptedMessage, sharedKey: CryptoKey) {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: base64ToArray(encrypted.iv) },
            sharedKey,
            base64ToArray(encrypted.cipherText)
        )

        return new TextDecoder().decode(decrypted)
    }

    async function rotateKeys(masterKey: CryptoKey) {
        const newKeyPair = await generateKeyPair(masterKey)
        return saveKeyPair(newKeyPair)
    }

    function arrayToBase64(bytes: Uint8Array) {
        return btoa(String.fromCharCode(...bytes))
    }

    function base64ToArray(str: string) {
        return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)))
    }

    return {
        generateMasterKey,
        generateKeyPair,
        saveKeyPair,
        getCurrentKeyPair,
        deriveSharedSecret,
        encryptMessage,
        decryptMessage,
        rotateKeys
    }
}


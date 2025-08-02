import { describe, expect, expectTypeOf, it } from "vitest"

describe("sharedSecret", async () => {
    const e2ee = useE2EE()
    const PASSPHRASE = "test"
    const salt = "salt"

    const masterKey = await e2ee.generateMasterKey(PASSPHRASE, salt)
    expect(masterKey).toBeDefined()

    const keyPair = await e2ee.generateKeyPair(masterKey)
    expect(keyPair).toBeDefined()

    await e2ee.saveKeyPair(keyPair)
    const myKeys = await e2ee.getCurrentKeyPair()
    expect(myKeys).toBeDefined()


    const theirMasterKey = await e2ee.generateMasterKey(PASSPHRASE.concat(PASSPHRASE), salt.concat(salt))
    expect(theirMasterKey).toBeDefined()

    const theirKeyPair = await e2ee.generateKeyPair(theirMasterKey)
    expect(theirKeyPair).toBeDefined()

    const sharedSecret = await e2ee.deriveSharedSecret(myKeys.privateKey, theirKeyPair.publicKey)
    expect(sharedSecret).toBeDefined()

    const testMsgStr = "Привет!"

    it("can encrypt message", async () => {
        const encrypted = await e2ee.encryptMessage(testMsgStr, sharedSecret)
        expect(encrypted).toBeDefined()
    })

    it("can decrypt the same message", async () => {
        const encrypted = await e2ee.encryptMessage(testMsgStr, sharedSecret)

        const decrypted = await e2ee.decryptMessage(encrypted, sharedSecret)
        expect(decrypted).toBe(testMsgStr)
        expectTypeOf(decrypted).toBeString()
    })
})

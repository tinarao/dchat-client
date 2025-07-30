export function usePassphraseModal() {
    const isOpen = useState('isPassphraseModalOpen', () => false)

    function showModal() {
        isOpen.value = true
    }

    function closeModal() {
        isOpen.value = false
    }

    return { isOpen, showModal, closeModal }
}

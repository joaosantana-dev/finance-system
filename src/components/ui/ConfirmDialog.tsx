import { Button, Dialog, Text } from '@chakra-ui/react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', isLoading, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={({ open: o }) => { if (!o) onClose() }}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="400px">
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>{description}</Text>
          </Dialog.Body>
          <Dialog.Footer gap={3}>
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button colorPalette="red" loading={isLoading} onClick={onConfirm}>{confirmLabel}</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

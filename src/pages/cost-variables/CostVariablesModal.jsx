import { Modal } from '../../components/ui/Modal'
import { CostVariables } from './CostVariables'

export function CostVariablesModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Cost Variables" size="xl">
      <CostVariables />
    </Modal>
  )
}

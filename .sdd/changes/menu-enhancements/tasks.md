# menu-enhancements Change Tasks

## Phase 1: Cocina pending check on close

- [x] 1.1 Add checkCocinaPendiente(mesaId) function in useAppStore that queries cocinaRepo.getByMesaId
- [x] 1.2 Filter for pending items: status !== 'listo' && status !== 'cancelado'  
- [x] 1.3 Integrate into closeCuenta - throw error if pending items exist, show warning to user
- [x] 1.4 Test the flow

## Phase 2: Takeaway-cocina sync

- [x] 2.1 Add syncTakeawayToCocina(takeawayId) function in useAppStore
- [x] 2.2 Map takeaway status to cocina status (pendiente→pendiente, preparando→preparando, listo→listo)
- [x] 2.3 Call syncTakeawayToCocina from updateTakeaway when status changes
- [x] 2.4 Test the sync

## Phase 3: Save bebidaIds  

- [x] 3.1 Update MenuPage.jsx to include bebidaIds in saveMenuDelDia payload (line 70-77)
- [x] 3.2 saveMenuDelDia in useAppStore already passes through all fields, just need to pass bebidaIds
- [x] 3.3 Test menu creation with drinks

## Phase 4: Edit menu items in notes

- [x] 4.1 Create EditMenuItemModal.jsx in src/components/mesa/
- [x] 4.2 Parse nota string to pre-fill form (format: "Primero | Segundo | Postre | Bebida")
- [x] 4.3 Add edit button to menu items in MesaDrawer (only for tipo === 'menu')
- [x] 4.4 On save, update mesa.pedidos item via updateMesa
- [x] 4.5 Test editing menu items
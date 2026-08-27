/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../../../../hooks/common/use-boolean-state'
import { cypressId } from '../../../../../../../utils/cypress-attribute'
import { CheatsheetInNewTabButton } from '../../../../../../cheatsheet/cheatsheet-in-new-tab-button'
import { CommonModal } from '../../../../../../common/modals/common-modal'
import { WaitSpinner } from '../../../../../../common/wait-spinner/wait-spinner'
import { TranslatedDropdownItem } from '../../translated-dropdown-item'
import React, { Fragment, Suspense } from 'react'
import { Modal } from 'react-bootstrap'
import { Search as IconSearch } from 'react-bootstrap-icons'

// Lazy-loaded because the cheatsheet pulls in the complete app extension
// registry, which would otherwise be part of the initial bundle of every page.
const CheatsheetContent = React.lazy(() =>
  import('../../../../../../cheatsheet/cheatsheet-content').then((module) => ({
    default: module.CheatsheetContent
  }))
)

/**
 * Renders the cheatsheet menu entry for the help dropdown.
 */
export const CheatsheetHelpMenuEntry: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <TranslatedDropdownItem
        i18nKey={'appbar.help.help.cheatsheet'}
        icon={IconSearch}
        onClick={showModal}
        {...cypressId('open.cheatsheet-button')}
      />
      <CommonModal
        modalSize={'xl'}
        show={modalVisibility}
        onHide={closeModal}
        showCloseButton={true}
        titleI18nKey={'cheatsheet.modal.title'}
        additionalTitleElement={
          <div className={'d-flex flex-row-reverse w-100 mx-2'}>
            <CheatsheetInNewTabButton onClick={closeModal} />
          </div>
        }>
        <Modal.Body>
          <Suspense fallback={<WaitSpinner />}>
            <CheatsheetContent />
          </Suspense>
        </Modal.Body>
      </CommonModal>
    </Fragment>
  )
}

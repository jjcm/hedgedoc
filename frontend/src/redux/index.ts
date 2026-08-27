/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isDevMode } from '../utils/test-modes'
import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { darkModeReducer } from './dark-mode/slice'
import { editorConfigReducer } from './editor-config/slice'
import { userReducer } from './user/slice'
import { rendererStatusReducer } from './renderer-status/slice'
import { realtimeStatusReducer } from './realtime/slice'
import type { NoteDetails } from './note-details/types'
import { printModeReducer } from './print-mode/slice'
import { pinnedNotesReducer } from './pinned-notes/slice'
import { csrfTokenReducer } from './csrf-token/slice'

/**
 * State slices that are only used by specific pages (like the note editor)
 * and inject themselves into the store when their slice module is imported.
 * This keeps their reducers - and everything those import, like the
 * frontmatter parser - out of the bundles of pages that never use them.
 */
export interface LazyLoadedSlices {
  noteDetails: NoteDetails
}

export const rootReducer = combineSlices({
  darkMode: darkModeReducer,
  editorConfig: editorConfigReducer,
  user: userReducer,
  rendererStatus: rendererStatusReducer,
  realtimeStatus: realtimeStatusReducer,
  printMode: printModeReducer,
  pinnedNotes: pinnedNotesReducer,
  csrfToken: csrfTokenReducer
}).withLazyLoadedSlices<LazyLoadedSlices>()

export const store = configureStore({
  reducer: rootReducer,
  devTools: isDevMode
})

// The lazy slices are typed as always present: their pages import the slice
// modules (which inject the reducers) before any of their code reads the
// state, and other pages never touch these slice states.
export type ApplicationState = ReturnType<typeof store.getState> & LazyLoadedSlices

export const getGlobalState = (): ApplicationState => store.getState() as ApplicationState

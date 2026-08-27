'use client'
/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../utils/logger'
import { ApplicationLoaderError } from './application-loader-error'
import { createSetUpTaskList } from './initializers'
import { LoadingScreen } from './loading-screen/loading-screen'
import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import React, { Fragment, Suspense, useMemo } from 'react'
import { useAsync } from 'react-use'

const log = new Logger('ApplicationLoader')

/**
 * Routes that render correctly without waiting for the client-side setup
 * tasks (session, guest login, preferences) to finish. These render
 * immediately — server-side and on first paint — while the setup tasks run in
 * the background, instead of being replaced by a loading screen.
 */
const BOOT_INDEPENDENT_ROUTES = ['/login']

/**
 * Initializes the application and executes all the setup tasks.
 * It renders a {@link LoadingScreen} while this is happening. If there are any error, they will be displayed in the {@link LoadingScreen}.
 *
 * @param children The children in the React dom that should be shown once the application is loaded.
 */
export const ApplicationLoader: React.FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname()
  const renderWhileLoading = BOOT_INDEPENDENT_ROUTES.includes(pathname ?? '')
  const { error, loading } = useAsync(async () => {
    const initTasks = createSetUpTaskList()
    for (const task of initTasks) {
      try {
        await task.task()
      } catch (reason: unknown) {
        log.error('Error while initialising application', reason)
        throw new ApplicationLoaderError(task.name, reason)
      }
    }
  }, [])

  const errorBlock = useMemo(() => {
    if (error) {
      return (
        <Fragment>
          {error.message}
          <br />
          For further information look into the browser console.
        </Fragment>
      )
    } else {
      return null
    }
  }, [error])

  if (!!errorBlock || (loading && !renderWhileLoading)) {
    return <LoadingScreen errorMessage={errorBlock} />
  } else {
    return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
  }
}

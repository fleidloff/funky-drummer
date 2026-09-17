'use client'

import { Panel } from '@/features/panel'
import { useTransport } from '@/features/transport'

export default function Page() {
  const controls = useTransport()

  return <Panel {...controls} />
}

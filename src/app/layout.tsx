import type { Metadata } from 'next'
import { StoreProvider } from '@/components/StoreProvider'
import { ChakraProvider } from '@/providers/ChakraProvider'

export const metadata: Metadata = {
  title: 'Dropbox Clone',
  description: 'A modern file storage and sharing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <StoreProvider>{children}</StoreProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}


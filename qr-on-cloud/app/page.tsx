'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function Component() {
  const [url, setUrl] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setQrCodeUrl('')

    try {
      const response = await fetch(process.env.NODE_ENV == "production"
        ? "/api/generate "
        : "http://localhost:8000/generate", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate QR code')
      }

      const data = await response.json()
      setQrCodeUrl(data.key)
    } catch (error) {
      console.error('Error generating QR code:', error)
      setError('Failed to generate QR code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">QR Code Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Enter URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <Button 
              className="w-full" 
              type="submit" 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {qrCodeUrl && (
            <div className="mt-4">
              <div className="relative w-full aspect-square">
                <Image
                  src={"https://cdn-qr-code-devops.dhairyashah.dev/"+ qrCodeUrl + ".png"}
                  alt="Generated QR Code"
                  layout="fill"
                  objectFit="contain"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
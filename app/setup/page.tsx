"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, FileJson, Server, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

const EXAMPLE_CONFIG = `{
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "appName": "My Pi App",
  "sandbox": true
}`

type Step = 'intro' | 'create' | 'host' | 'connect'

interface ValidatedConfig {
  appId: string
  appName: string
  sandbox: boolean
  hasApiKey: boolean
  hasWalletAddress: boolean
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [configUrl, setConfigUrl] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validatedConfig, setValidatedConfig] = useState<ValidatedConfig | null>(null)
  const [copied, setCopied] = useState(false)
  
  const copyExample = async () => {
    await navigator.clipboard.writeText(EXAMPLE_CONFIG)
    setCopied(true)
    toast.success("Config template copied!")
    setTimeout(() => setCopied(false), 2000)
  }
  
  const validateConfig = async () => {
    if (!configUrl.trim()) {
      setValidationError("Please enter your config URL")
      return
    }
    
    setIsValidating(true)
    setValidationError(null)
    
    try {
      const response = await fetch('/api/config/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configUrl: configUrl.trim() })
      })
      
      const result = await response.json()
      
      if (result.valid) {
        setValidatedConfig(result.config)
        toast.success("Config validated successfully!")
      } else {
        setValidationError(result.errors?.[0] || "Invalid config")
      }
    } catch {
      setValidationError("Failed to validate config. Check your URL and try again.")
    } finally {
      setIsValidating(false)
    }
  }
  
  const completeSetup = async () => {
    // Store the config URL in a secure HTTP-only cookie
    try {
      await fetch('/api/config/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configUrl: configUrl.trim() })
      })
      toast.success("Setup complete!")
      router.push('/onboarding')
    } catch {
      toast.error("Failed to save config. Please try again.")
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['intro', 'create', 'host', 'connect'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s 
                  ? 'bg-primary text-primary-foreground' 
                  : (['intro', 'create', 'host', 'connect'].indexOf(step) > i)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {(['intro', 'create', 'host', 'connect'].indexOf(step) > i) ? (
                  <Check className="size-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>
        
        {/* Step: Intro */}
        {step === 'intro' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Set Up Your Pi App</CardTitle>
              <CardDescription>
                Connect your Pi Network app in 3 simple steps. Your credentials stay on your server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <FileJson className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">1. Create a config file</p>
                    <p className="text-sm text-muted-foreground">
                      A simple JSON file with your Pi Developer Portal credentials
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Server className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">2. Host it on your server</p>
                    <p className="text-sm text-muted-foreground">
                      Upload the file to your server where our platform can fetch it
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">3. Connect securely</p>
                    <p className="text-sm text-muted-foreground">
                      Provide the URL and we will validate the connection
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setStep('create')} className="w-full">
                Get Started
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Step: Create Config */}
        {step === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Config File</CardTitle>
              <CardDescription>
                Create a JSON file named <code className="px-1 py-0.5 bg-muted rounded text-xs">pi-config.json</code> with your credentials from the Pi Developer Portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 text-sm overflow-x-auto font-mono">
                  {EXAMPLE_CONFIG}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={copyExample}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
              
              <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  <strong>Where to find your credentials:</strong> Log into the{" "}
                  <a 
                    href="https://develop.pi" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    Pi Developer Portal
                    <ExternalLink className="size-3" />
                  </a>
                  {" "}and navigate to your app settings.
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="font-medium">Config fields:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><code className="text-foreground">appId</code> - Your app ID from the Developer Portal</li>
                  <li><code className="text-foreground">apiKey</code> - Your API key (keep this secret!)</li>
                  <li><code className="text-foreground">appName</code> - Display name for your app (optional)</li>
                  <li><code className="text-foreground">sandbox</code> - Set to <code>true</code> for testnet</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('intro')}>
                Back
              </Button>
              <Button onClick={() => setStep('host')} className="flex-1">
                I have created the file
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Step: Host Config */}
        {step === 'host' && (
          <Card>
            <CardHeader>
              <CardTitle>Host Your Config File</CardTitle>
              <CardDescription>
                Upload <code className="px-1 py-0.5 bg-muted rounded text-xs">pi-config.json</code> to your server and make it accessible via HTTPS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium">Example locations:</p>
                <div className="space-y-2 text-sm text-muted-foreground font-mono">
                  <p>https://yourapp.com/pi-config.json</p>
                  <p>https://yourapp.com/.well-known/pi-config.json</p>
                  <p>https://api.yourapp.com/config/pi.json</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
                <p className="text-sm font-medium">Security tips:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Use HTTPS (required for production)</li>
                  <li>Consider IP whitelisting if your server supports it</li>
                  <li>You can change or rotate your API key anytime by updating the file</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('create')}>
                Back
              </Button>
              <Button onClick={() => setStep('connect')} className="flex-1">
                I have hosted the file
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Step: Connect */}
        {step === 'connect' && (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Config</CardTitle>
              <CardDescription>
                Enter the URL where your config file is hosted. We will validate it and connect your app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Config URL</FieldLabel>
                  <Input
                    type="url"
                    placeholder="https://yourapp.com/pi-config.json"
                    value={configUrl}
                    onChange={(e) => {
                      setConfigUrl(e.target.value)
                      setValidationError(null)
                      setValidatedConfig(null)
                    }}
                    disabled={isValidating}
                  />
                  <FieldDescription>
                    The full URL to your pi-config.json file
                  </FieldDescription>
                  {validationError && (
                    <FieldError>{validationError}</FieldError>
                  )}
                </Field>
              </FieldGroup>
              
              {!validatedConfig && (
                <Button 
                  onClick={validateConfig} 
                  disabled={isValidating || !configUrl.trim()}
                  className="w-full"
                >
                  {isValidating ? (
                    <>
                      <Spinner className="mr-2" />
                      Validating...
                    </>
                  ) : (
                    "Validate Config"
                  )}
                </Button>
              )}
              
              {validatedConfig && (
                <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="size-5 text-green-600" />
                    <span className="font-medium text-green-600">Config validated!</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">App Name</span>
                      <span className="font-medium">{validatedConfig.appName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">App ID</span>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{validatedConfig.appId}</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Network</span>
                      <Badge variant={validatedConfig.sandbox ? "secondary" : "default"}>
                        {validatedConfig.sandbox ? "Testnet" : "Mainnet"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">API Key</span>
                      <Badge variant="outline" className="text-green-600 border-green-600/30">
                        <Check className="size-3 mr-1" />
                        Configured
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('host')}>
                Back
              </Button>
              <Button 
                onClick={completeSetup} 
                disabled={!validatedConfig}
                className="flex-1"
              >
                Complete Setup
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  )
}

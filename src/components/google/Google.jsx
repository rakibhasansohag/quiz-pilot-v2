import React from 'react'
import { Button } from '../ui/button'
import { signIn } from 'next-auth/react'

export default function Google() {
    const handleGoogleLogin = () => {
        signIn("google",{callbackUrl : "/"})
    }
    
    return (
        <div>
            {/* OR divider */}
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
            </div>

            {/* Google button */}
            <Button
                type="button"
                variant="outline"
                className="w-full gap-4 bg-white"
                onClick={handleGoogleLogin}
            >
                <svg className="h-4 w-4" viewBox="0 0 533.5 544.3" aria-hidden="true">
                    <path fill="#EA4335" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.4c-6.4 34.5-25.8 63.7-55 83.2v68h88.9c52-47.9 80.2-118.5 80.2-196z" />
                    <path fill="#34A853" d="M272 544.3c72.6 0 133.6-24 178.1-65.1l-88.9-68c-24.7 16.6-56.4 26.4-89.2 26.4-68.6 0-126.8-46.3-147.6-108.4H32.8v68.5C77.5 493 169.3 544.3 272 544.3z" />
                    <path fill="#4A90E2" d="M124.4 329.2c-10.4-30.9-10.4-64.1 0-95l.1-68.5H32.8c-42.7 85.4-42.7 184.7 0 270.1l91.6-68.6z" />
                    <path fill="#FBBC05" d="M272 106.3c39.4-.6 77.3 14 106.2 41.4l79.3-79.3C412.7 23 344.6-1.3 272 0 169.3 0 77.5 51.3 32.8 146.3l91.6 68.5C145.2 152.7 203.4 106.3 272 106.3z" />
                </svg>
                Login with Google
            </Button>
        </div>
    )
}

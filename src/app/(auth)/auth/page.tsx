import { AuthForm } from "@/components/auth/auth-form"
import { WavyBackground } from "@/components/ui/wavy-background"

export default function AuthPage() {
    return (
        <WavyBackground
            className="flex flex-col items-center justify-center p-6 relative z-10"
            containerClassName="min-h-screen bg-[#020617]"
            waveOpacity={0.2}
            speed="slow"
            blur={15}
        >
            <div className="w-full flex justify-center">
                <AuthForm />
            </div>
        </WavyBackground>
    )
}

import Link from "next/link";
import LoginLottie from "@/components/shared/LoginLottie/LoginLottie";
import { GalleryVerticalEnd } from "lucide-react";


const AuthLayout = ({ children }) => {
    return (
        <div className="grid min-h-svh md:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10 bg-muted">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>

                        <span className='text-xl font-bold'>QuizPilot</span>
                    </Link>
                </div>
                {children}
            </div>
            <div className="bg-background hidden md:flex md:items-center md:justify-center">
                <LoginLottie />
            </div>
        </div>
    );
};

export default AuthLayout;
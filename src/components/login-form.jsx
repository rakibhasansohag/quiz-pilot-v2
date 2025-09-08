"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Google from '@/components/google/Google';

import { toast } from 'react-hot-toast';
import Link from "next/link"
import { useForm } from "react-hook-form"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"


export function LoginForm({ className, ...props }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // If already signed in, redirect away from /login
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleLogin = async (data) => {
    setLoading(true);

    const { email, password } = data;

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/',
    });

    setLoading(false);

    if (res?.error) {
      toast.error(res.error || 'Login failed');
      return;
    }
    // if success, NextAuth will set session cookie; redirect
    if (res?.ok) {
      toast.success('Login successful');
      router.push(res.url || '/');
      console.log(res.url);
    }
  }

  return (
    <>
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit(handleLogin)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
        </div>

        <div className="grid gap-6">

          <div>
            <Label htmlFor="email" className={"ml-1"}>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='you@example.com'
              className='mt-1'
              {...register("email", {
                required: "Email is required",
              })}
            />
            {errors.email && <p className="text-red-500 mt-1 ml-1 text-xs">{errors.email.message}</p>}
          </div>


          <div>
            <div className="flex items-center">
              <Label htmlFor="password" className={"ml-1"}>Password</Label>

              {/* <a href="#" className="ml-auto text-xs underline-offset-4 hover:underline">
                Forgot your password?
              </a> */}

            </div>
            <div className="relative">
              <Input
                id='password'
                type={showPass ? "text" : "password"}
                placeholder='Enter your Password'
                className='mt-1'
                {...register("password", {
                  required: "Password is required",
                })}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-white hover:bg-primary rounded-full"
              >
                {
                  showPass ?
                    <FaRegEyeSlash />
                    :
                    <FaRegEye />
                }
              </Button>
            </div>
            {errors.password && <p className="text-red-500 mt-1 ml-1 text-xs">{errors.password.message}</p>}
          </div>


          <Button type='submit' disabled={loading}>
            {loading ? 'Logging in..' : 'Login'}
          </Button>
          <div
            className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>

          <Google method="login"/>
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>

    </>
  );
}


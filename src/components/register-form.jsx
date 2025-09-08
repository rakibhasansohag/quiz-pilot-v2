"use client"

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Google from '@/components/google/Google';
import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const signupSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirm: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirm, {
        path: ['confirm'],
        message: 'Passwords do not match',
    });


const RegisterForm = () => {
    const router = useRouter();

    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);


    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: '', email: '', password: '', confirm: '' },
    });

    async function onSubmit(values) {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                }),
            });
            const data = await res.json();
            if (res.status === 201) {
                toast.success('Account created. Please login.');
                reset();
                setTimeout(() => router.push('/login'), 700);
            } else {
                toast.error(data?.error || 'Signup failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error');
        }
    }



    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
                <Label htmlFor='name' className={"ml-1"}>Full name</Label>
                <Input
                    id='name'
                    placeholder='Your full name'
                    {...register('name')}
                    className='mt-1'
                />
                {errors.name && (
                    <p className="text-red-500 mt-1 ml-1 text-xs">
                        {errors.name.message}
                    </p>
                )}
            </div>

            <div>
                <Label htmlFor='email' className={"ml-1"}>Email</Label>
                <Input
                    id='email'
                    type='email'
                    placeholder='you@example.com'
                    {...register('email')}
                    className='mt-1'
                />
                {errors.email && (
                    <p className="text-red-500 mt-1 ml-1 text-xs">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div>
                <Label htmlFor='password' className={"ml-1"}>Password</Label>
                <div className='relative'>
                    <Input
                        id='password'
                        type={showPass ? 'text' : 'password'}
                        placeholder='At least 6 characters'
                        {...register('password')}
                        className='mt-1'
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
                {errors.password && (
                    <p className="text-red-500 mt-1 ml-1 text-xs">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div>
                <Label htmlFor='confirm' className={"ml-1"}>Confirm Password</Label>
                <div className='relative'>
                    <Input
                        id='confirm'
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder='Repeat password'
                        {...register('confirm')}
                        className='mt-1'
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-white hover:bg-primary rounded-full"
                    >
                        {
                            showConfirmPass ?
                                <FaRegEyeSlash />
                                :
                                <FaRegEye />
                        }
                    </Button>
                </div>
                {errors.confirm && (
                    <p className="text-red-500 mt-1 ml-1 text-xs">
                        {errors.confirm.message}
                    </p>
                )}
            </div>
            <div className='flex flex-col'>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create account'}
                </Button>
            </div>
            <div
                className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="text-muted-foreground relative z-10 px-2">
                    Or continue with
                </span>
            </div>

            <Google method="Register" />

            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                    Sign In
                </Link>
            </div>
        </form>
    );
};

export default RegisterForm;
import RegisterForm from '@/components/register-form';

const SignupPage = () => {
    
    return (
        <div className="mt-10 md:mt-0 flex flex-1 md:items-center justify-center">
            <div className="w-full max-w-xs">
                <RegisterForm/>
            </div>
        </div>
    );
};

export default SignupPage;
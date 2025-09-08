import { LoginForm } from "@/components/login-form";

const LoginPage = () => {

  return (
        <div className="mt-10 md:mt-0 flex flex-1 md:items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
  );
};

export default LoginPage;
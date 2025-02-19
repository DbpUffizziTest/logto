import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';

import useContinueSignInWithPassword from '@/hooks/use-continue-sign-in-with-password';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import type { ArrayElement } from '@/types';
import { UserFlow } from '@/types';

import EmailForm from './EmailForm';

type FormProps = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type Props = FormProps & {
  signInMethod: ArrayElement<SignIn['methods']>;
};

const EmailSignInWithVerificationCode = (props: FormProps) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useSendVerificationCode(
    UserFlow.signIn,
    SignInIdentifier.Email
  );

  return (
    <EmailForm
      onSubmit={onSubmit}
      {...props}
      submitButtonText="action.sign_in"
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
    />
  );
};

const EmailSignInWithPassword = (props: FormProps) => {
  const onSubmit = useContinueSignInWithPassword(SignInIdentifier.Email);

  return <EmailForm onSubmit={onSubmit} {...props} submitButtonText="action.sign_in" />;
};

const EmailSignIn = ({ signInMethod, ...props }: Props) => {
  const { password, isPasswordPrimary, verificationCode } = signInMethod;

  // Continue with password
  if (password && (isPasswordPrimary || !verificationCode)) {
    return <EmailSignInWithPassword {...props} />;
  }

  // Send verification code
  if (verificationCode) {
    return <EmailSignInWithVerificationCode {...props} />;
  }

  return null;
};

export default EmailSignIn;

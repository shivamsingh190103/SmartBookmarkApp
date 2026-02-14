type AuthErrorProps = {
  error?: string;
};

const messages: Record<string, string> = {
  oauth_start_failed: "Could not start Google sign-in. Please try again.",
  missing_code: "Sign-in was interrupted. Please try again.",
  auth_callback_failed: "Sign-in failed. Please try again."
};

export function AuthError({ error }: AuthErrorProps) {
  if (!error) return null;

  const message = messages[error] ?? "An error occurred. Please try again.";

  return (
    <div className="mx-auto mb-4 max-w-xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}

import CustomButton from "@/src/components/CustomButton";
import CustomInput from "@/src/components/CustomInput";

export default function ResetPage() {
  return (
    <div className="flex flex-col px-2 gap-8 items-center min-h-full">
      <img
        className="self-start py-8 px-2"
        src="/logo/primary-full-noslogan.png"
        alt=""
      />
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold pb-2">Forgot Password</h1>
        <div>
          <label htmlFor="email">Check for a verification code</label>
          <form>
            <CustomInput
              name="otp"
              type="text"
              placeholder="Enter your 6-digit code"
              required
            />
            <CustomButton className="flex-10" color="primary" type="submit">
              Submit
            </CustomButton>
          </form>
        </div>
        <p className="max-w-sm">
          If you don’t see the email in your inbox, check your spam folder. If
          it’s not there, the email address may not be confirmed, or it may not
          match an existing LinkedIn account.
        </p>
      </div>
      <div className="flex justify-between gap-4 w-[390px]"></div>
    </div>
  );
}

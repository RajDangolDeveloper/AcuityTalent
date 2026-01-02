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
      <h1 className="text-4xl font-bold pb-2">Reset your Password</h1>
      <form>
        <CustomInput
          name="password"
          type="text"
          placeholder="Enter your 6-digit code"
          required
        />
        <CustomInput
          name="confirmPassword"
          type="text"
          placeholder="Enter your 6-digit code"
          required
        />
        <CustomButton className="flex-10" color="primary" type="submit">
          Submit
        </CustomButton>
      </form>
    </div>
  );
}
